const nodemailer = require("nodemailer");

// Create a transporter object
let transporter = nodemailer.createTransport({
    sendmail: true,
    newline: "unix",
    path: "/usr/sbin/sendmail" // Path to your sendmail binary
});


class mailCreator {
	
	
	constructor(id) {

		this.sender = '"BizExpenses" <no-reply@hugochilemme.com>';

	}

	setData(data) {
		this.data = data;

		// replace all arguments in the template
		(this.arguments || []).forEach(arg => {
			const key = arg.replace(/{|}/g, "");
			this.template = this.template.replace(arg, data[key]);
		});

		// detect missing argument
		if (this.template.match(/{.*?}/g)) {
			throw new Error("Missing argument");
		}
	}

	setRecipients(recipient) {
		if (!recipient) {
			throw new Error("Recipient not found");
		}

		if (typeof recipient === "string") {
			recipient = [recipient];
		}

		this.recipient = recipient;
	}

	setRecipientsToBcc(recipient) {
		if (!recipient) {
			throw new Error("Recipient not found");
		}

		if (typeof recipient === "string") {
			recipient = [recipient];
		}

		// Si un seul destinataire, envoi en "to"
		if (recipient.length === 1) {
			this.recipient = recipient;
			this.recipientBcc = undefined;
		} else {
			this.recipientBcc = recipient;
		}
	}

	setSubject(subject) {

		if (!subject) {
			throw new Error("Subject not found");
		}

		this.subject = subject;
	}


	setText(text) {
		if (!text) {
			throw new Error("Text not found");
		}
		if (typeof text !== "string") {
			throw new Error("Text must be a string");
		}
		this.template = text.replace(/\n/g, "<br>");
	}

	send() {

		// derniere verification 
		if (!this.recipient || !this.subject || !this.template) {
			throw new Error(`Can"t send mail without recipient, subject or template`);
		}


		transporter.sendMail(
		{
			from: this.sender,
			to: this.recipient,
			bcc: this.recipientBcc,
			subject: this.subject,
			html: this.template
		}, 
		(error, info) => {
			if (error) {
				return console.log("Error occurred:", error);
			}
			console.log("Message sent:", info.messageId);
		});

	}


}



module.exports = mailCreator;