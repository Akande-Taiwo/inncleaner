import type { Order } from "../types";

export interface OrderStore {
  create(order: Order): Promise<Order>;
  get(reference: string): Promise<Order | null>;
  findByPaystackReference(paystackReference: string): Promise<Order | null>;
  update(reference: string, patch: Partial<Order>): Promise<Order | null>;
  list(): Promise<Order[]>;
}
