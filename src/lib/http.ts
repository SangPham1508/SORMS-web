type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function http<T>(url: string, options?: { method?: HttpMethod; body?: unknown }) {
	const res = await fetch(url, {
		method: options?.method || "GET",
		headers: {
			"Content-Type": "application/json",
		},
		body: options?.body ? JSON.stringify(options.body) : undefined,
		cache: "no-store",
	});
	if (!res.ok) {
		throw new Error(`HTTP ${res.status} ${res.statusText}`);
	}
	return (await res.json()) as T;
}


