import { ColumnDef } from "@tanstack/react-table";

export type PaymentColumnType = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
  date: string;
};

export const paymentTableColumns: ColumnDef<PaymentColumnType>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
]; 