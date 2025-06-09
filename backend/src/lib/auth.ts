import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const SECRET = process.env.JWT_SECRET || "votre_secret_ici";

// Générer un token JWT
export function generateToken(payload: object): string {
	return jwt.sign(payload, SECRET, { expiresIn: '30d' });
}

// Vérifier un token JWT (middleware Express)
export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith('Bearer ')) {
		const token = authHeader.split(' ')[1];
		jwt.verify(token, SECRET, (err, user) => {
			if (err) return res.sendStatus(403);
			// Optionally, you can type user as JwtPayload | string
			(req as any).user = user;
			next();
		});
	} else {
		res.sendStatus(401);
	}
}