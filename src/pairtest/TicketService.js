import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  #maxTicketsPerTime = 20;
  #acctId = Math.ceil(Math.random() * (1000 - 1) + 1);

  #includesAdultTicket(ticketTypeRequests) {
    return ticketTypeRequests.some(
      (request) => request.getTicketType() === "ADULT"
    );
  }

  #isValidTicketType(type) {
    return ["ADULT", "CHILD", "INFANT"].includes(type);
  }

  #getTicketPrice(type) {
    const ticketPrices = {
      ADULT: 100,
      CHILD: 50,
      INFANT: 0,
    };
    return ticketPrices[type] || 0;
  }

  #calculateTotalPrice(ticketTypeRequests) {
    let totalPrice = 0;
    for (const request of ticketTypeRequests) {
      const type = request.getTicketType();
      const qty = request.getNoOfTickets();
      const price = this.#getTicketPrice(type);
      totalPrice += price * qty;
    }
    return totalPrice;
  }

  #calculateTotalSeats(ticketTypeRequests) {
    let totalSeats = 0;

    for (const request of ticketTypeRequests) {
      const type = request.getTicketType();
      const qty = request.getNoOfTickets();

      if (type === "ADULT" || type === "CHILD") {
        totalSeats += qty;
      }
    }
    return totalSeats;
  }

  purchaseTickets(...ticketTypeRequests) {
    const acctId = this.#acctId;

    if (ticketTypeRequests.length === 0) {
      throw new InvalidPurchaseException(
        "Please provide at least one ticket type request."
      );
    }

    let totalTickets = 0;
    for (const request of ticketTypeRequests) {
      if (!(request instanceof TicketTypeRequest)) {
        throw new Error("Invalid ticket type request.");
      }

      const type = request.getTicketType();
      const qty = request.getNoOfTickets();

      if (!Number.isInteger(qty) || qty <= 0) {
        throw new Error(
          "Invalid ticket quantity. Quantity must be a positive integer."
        );
      }

      if (!this.#isValidTicketType(type)) {
        throw new Error(`Invalid ticket type: ${type}`);
      }

      totalTickets += qty;
    }

    if (totalTickets > this.#maxTicketsPerTime) {
      throw new InvalidPurchaseException(
        `You cannot purchase more than ${
          this.#maxTicketsPerTime
        } tickets at a time.`
      );
    }

    if (!this.#includesAdultTicket(ticketTypeRequests)) {
      throw new InvalidPurchaseException(
        "Child and Infant tickets can only purchased alongside an Adult Ticket."
      );
    }

    const totalPrice = this.#calculateTotalPrice(ticketTypeRequests);
    const totalNoOfSeats = this.#calculateTotalSeats(ticketTypeRequests);

    const ticketPaymentService = new TicketPaymentService(acctId, totalPrice);
    ticketPaymentService.makePayment();

    const seatReservationService = new SeatReservationService(
      acctId,
      totalNoOfSeats
    );
    seatReservationService.reserveSeat();
  }
}
