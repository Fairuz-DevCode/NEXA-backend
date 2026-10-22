import pool from "../../config/db.js";
import { AddressDTO, AddressResponse, UpdateAddressDTO } from "./address.types.js";

export class AddressModel {
  static async createAddress(
    userId: number,
    { label, phone, street_address, city, postal_code, country }: AddressDTO
  ): Promise<AddressResponse> {
    const result = await pool.query(
      `INSERT INTO addresses (user_id, label, phone, street_address, city, postal_code, country) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING id, user_id, label, phone, street_address, city, postal_code, country`,
      [userId, label, phone, street_address, city, postal_code, country]
    );
    return result.rows[0];
  }

  static async getAddressesByUserId(userId: number): Promise<AddressResponse[]> {
    const result = await pool.query(
      `SELECT id, user_id, label, phone, street_address, city, postal_code, country 
      FROM addresses WHERE user_id = $1 ORDER BY id ASC`,
      [userId]
    );
    return result.rows;
  }

  static async getAddressByIdAndUserId(addressId: number | string, userId: number): Promise<AddressResponse | null> {
    const result = await pool.query(
      `SELECT id, user_id, label, phone, street_address, city, postal_code, country 
      FROM addresses WHERE id = $1 AND user_id = $2`,
      [addressId, userId]
    );
    return result.rows[0] || null;
  }

  static async updateAddress(
    addressId: number | string,
    userId: number,
    { label, phone, street_address, city, postal_code, country }: UpdateAddressDTO
  ): Promise<AddressResponse | null> {
    const result = await pool.query(
      `UPDATE addresses 
      SET label = COALESCE($1, label), 
          phone = COALESCE($2, phone), 
          street_address = COALESCE($3, street_address), 
          city = COALESCE($4, city), 
          postal_code = COALESCE($5, postal_code), 
          country = COALESCE($6, country) 
      WHERE id = $7 AND user_id = $8 
      RETURNING id, user_id, label, phone, street_address, city, postal_code, country`,
      [label || null, phone || null, street_address || null, city || null, postal_code || null, country || null, addressId, userId]
    );
    return result.rows[0] || null;
  }

  static async deleteAddress(addressId: number | string, userId: number): Promise<any> {
    const result = await pool.query(
      `DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id`,
      [addressId, userId]
    );
    return result.rows[0] || null;
  }
}
