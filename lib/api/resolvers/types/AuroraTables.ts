export interface PartTableRow {
  part_id: number;
  part_name: string;
  part_category: string;
  unit_price: number;
}

export interface OrderTableRow {
  order_id: number;
  part_id: number;
  order_date: string;
  quantity_ordered: number;
  fulfilled: boolean;
}

export interface ShipmentTableRow {
  shipment_id: number;
  part_id: number;
  shipment_date: string;
  quantity_shipped: number;
}
