import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketContext } from "../context/TicketContext";
import styles from "./tickets.module.css";

// Filter options for ticket status
type FilterStatus = "all" | "open" | "completed";

export const Tickets: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, users, createTicket, getUserById, loading, error } = useTicketContext();

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [newTicketDescription, setNewTicketDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter tickets based on status
  const filteredTickets = tickets.filter((ticket) => {
    switch (filterStatus) {
      case "open":
        return !ticket.completed;
      case "completed":
        return ticket.completed;
      default:
        return true;
    }
  });

  // Handle creating a new ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketDescription.trim()) return;

    try {
      setIsCreating(true);
      await createTicket(newTicketDescription.trim());
      setNewTicketDescription("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to create ticket:", err);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle navigation to ticket details
  const handleTicketClick = (ticketId: number) => {
    navigate(`/${ticketId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles["container"]}>
        <div className={styles["loading"]}>Loading tickets...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles["container"]}>
        <div className={styles["error"]}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles["container"]}>
      {/* Header with title and add button */}
      <div className={styles["header"]}>
        <h2>Tickets ({filteredTickets.length})</h2>
        <button onClick={() => setShowAddForm(!showAddForm)} className={styles["addButton"]}>
          {showAddForm ? "Cancel" : "+ Add Ticket"}
        </button>
      </div>

      {/* Filter controls */}
      <div className={styles["filters"]}>
        <div className={styles["filterGroup"]}>
          <label htmlFor='status-filter'>Filter by status:</label>
          <select
            id='status-filter'
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className={styles["filterSelect"]}
          >
            <option value='all'>All Tickets</option>
            <option value='open'>Open Tickets</option>
            <option value='completed'>Completed Tickets</option>
          </select>
        </div>
      </div>

      {/* Add ticket form */}
      {showAddForm && (
        <div className={styles["addForm"]}>
          <form onSubmit={handleCreateTicket}>
            <div className={styles["formGroup"]}>
              <label htmlFor='ticket-description'>Description:</label>
              <textarea
                id='ticket-description'
                value={newTicketDescription}
                onChange={(e) => setNewTicketDescription(e.target.value)}
                placeholder='Enter ticket description...'
                className={styles["descriptionInput"]}
                rows={3}
                required
                disabled={isCreating}
              />
            </div>
            <div className={styles["formActions"]}>
              <button
                type='submit'
                className={styles["submitButton"]}
                disabled={isCreating || !newTicketDescription.trim()}
              >
                {isCreating ? "Creating..." : "Create Ticket"}
              </button>
              <button
                type='button'
                onClick={() => {
                  setShowAddForm(false);
                  setNewTicketDescription("");
                }}
                className={styles["cancelButton"]}
                disabled={isCreating}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets list */}
      <div className={styles["ticketsList"]}>
        {filteredTickets.length === 0 ? (
          <div className={styles["emptyState"]}>
            {filterStatus === "all"
              ? "No tickets found. Create your first ticket!"
              : `No ${filterStatus} tickets found.`}
          </div>
        ) : (
          <div className={styles["ticketsGrid"]}>
            {filteredTickets.map((ticket) => {
              const assignedUser = getUserById(ticket.assigneeId);

              return (
                <div
                  key={ticket.id}
                  className={`${styles["ticketCard"]} ${
                    ticket.completed ? styles["completed"] : ""
                  }`}
                  onClick={() => handleTicketClick(ticket.id)}
                >
                  <div className={styles["ticketHeader"]}>
                    <h3 className={styles["ticketTitle"]}>
                      #{ticket.id} - {ticket.description}
                    </h3>
                    <span
                      className={`${styles["statusBadge"]} ${
                        ticket.completed ? styles["completed"] : styles["open"]
                      }`}
                    >
                      {ticket.completed ? "Completed" : "Open"}
                    </span>
                  </div>

                  <div className={styles["ticketDetails"]}>
                    <div className={styles["assignee"]}>
                      <strong>Assigned to:</strong>{" "}
                      {assignedUser ? assignedUser.name : "Unassigned"}
                    </div>
                  </div>

                  <div className={styles["ticketActions"]}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTicketClick(ticket.id);
                      }}
                      className={styles["viewButton"]}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;
