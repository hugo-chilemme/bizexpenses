export interface ApiResponse<T = any> {
	data: T;
	status: number;
	message?: string;
}

export default async function fetchApi<T = any>(
	url: string,
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
	body?: any,
	options?: RequestInit
): Promise<ApiResponse<T>> {
	try {
		const authorization = localStorage.getItem('authorization');

		if (authorization) {
			if (!options) options = {};
			if (!options.headers) options.headers = {};
			(options.headers as Headers).Authorization = authorization;
		}

		if (!options) options = {};
		if (!options.headers) options.headers = {};
		(options.headers as Headers).Accept = 'application/json';
		(options.headers as Headers)['Content-Type'] = 'application/json';
		options.method = method;	

		if (body) {
			options.body = JSON.stringify(body);
		}

		console.log(body);
		console.log('fetchApi', '/api/v1/' + url, options);

		const response = await fetch('/api/v1/' + url, options);
		const data = await response.json().catch(() => null);

		console.log('fetchApi', url, options, data);

		return data;
	} catch (error: any) {
		return {
			status: 'error',
			errorId: 'fetch_error',
			message: error.message,
		}
	}
}
