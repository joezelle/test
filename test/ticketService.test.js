import TicketService from "../src/pairtest/TicketService.js";

import assert from "assert";

describe("TicketService", () => {
  it("should throw an error for an empty ticket request", () => {
    const ticketService = new TicketService();

    const accountId = 456;

    assert.throws(() => ticketService.purchaseTickets(accountId), Error);
  });

  it("should throw an error for an invalid ticket type request", () => {
    const ticketService = new TicketService();

    const accountId = 789;
    const invalidTicketTypeRequest = {
      ticketType: "INVALID_TYPE",
      noOfTickets: 2,
    };

    assert.throws(
      () => ticketService.purchaseTickets(accountId, invalidTicketTypeRequest),
      Error
    );
  });
});
