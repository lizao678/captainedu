import client from "./internal/httpClient";

export function list(params: any) {
  return client.get("/backend/v1/live/index", {
    page: params.page,
    size: params.size,
  });
}

export function store(params: any) {
  return client.post("/backend/v1/live/store", params);
}

export function detail(id: number) {
  return client.get(`/backend/v1/live/${id}`, {});
}

export function update(id: number, params: any) {
  return client.put(`/backend/v1/live/${id}`, params);
}

export function destroy(id: number) {
  return client.post(`/backend/v1/live/${id}/delete`, {});
}

export function startLive(id: number) {
  return client.post(`/backend/v1/live/${id}/start`, {});
}

export function endLive(id: number) {
  return client.post(`/backend/v1/live/${id}/end`, {});
} 