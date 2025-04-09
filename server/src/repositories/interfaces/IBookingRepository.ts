import { IBooking } from "../../models/booking";


export interface IBookingRepository {
    createBooking(data: Partial<IBooking>): Promise<IBooking>
}
