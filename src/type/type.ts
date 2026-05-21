import type { JwtPayload } from "jsonwebtoken";

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  created_at: Date;
  updated_at: Date;
};

export type TIssue = {
  id: number;
  title: string;
  description: string;
  type: "bug" | "feature_request";
  status: "open" | "in_progress" | "resolved";
  reporter_id: number;
  created_at:Date;
  updated_at:Date;
};