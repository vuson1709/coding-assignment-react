import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTicketContext } from "../context/TicketContext";
import styles from "./ticket-details.module.css";

export const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getTicketById,
    getUserById,
    users,
    assignTicket,
    unassignTicket,
    completeTicket,
    loading,
    error,
  } = useTicketContext();

  const [isUpdating, setIsUpdating] = useState(false);

  // Get ticket data
  const ticket = getTicketById(Number(id));
  const assignedUser = getUserById(ticket?.assigneeId || null);

  // Handle assignment changes
  const handleAssignUser = async (userId: number) => {
    if (!ticket) return;

    try {
      setIsUpdating(true);
      await assignTicket(ticket.id, userId);
    } catch (err) {
      console.error("Failed to assign user:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnassignUser = async () => {
    if (!ticket) return;

    try {
      setIsUpdating(true);
      await unassignTicket(ticket.id);
    } catch (err) {
      console.error("Failed to unassign user:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle completion toggle
  const handleToggleComplete = async () => {
    if (!ticket) return;

    try {
      setIsUpdating(true);
      await completeTicket(ticket.id, !ticket.completed);
    } catch (err) {
      console.error("Failed to update ticket completion:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles["container"]}>
        <div className={styles["loading"]}>Loading ticket details...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles["container"]}>
        <div className={styles["error"]}>Error: {error}</div>
        <button onClick={() => navigate("/")} className={styles["backButton"]}>
          Back to Tickets
        </button>
      </div>
    );
  }

  // Ticket not found
  if (!ticket) {
    return (
      <div className={styles["container"]}>
        <div className={styles["error"]}>Ticket not found</div>
        <button onClick={() => navigate("/")} className={styles["backButton"]}>
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div className={styles["container"]}>
      {/* Header with back button */}
      <div className={styles["header"]}>
        <button
          onClick={() => navigate("/")}
          className={styles["backButton"]}
          disabled={isUpdating}
        >
          ← Back to Tickets
        </button>
        <h2>Ticket #{ticket.id}</h2>
      </div>

      {/* Ticket information */}
      <div className={styles["ticketInfo"]}>
        <div className={styles["description"]}>
          <h3>Description</h3>
          <p>{ticket.description}</p>
        </div>

        <div className={styles["status"]}>
          <h3>Status</h3>
          <span
            className={`${styles["statusBadge"]} ${
              ticket.completed ? styles["completed"] : styles["open"]
            }`}
          >
            {ticket.completed ? "Completed" : "Open"}
          </span>
        </div>

        <div className={styles["assignee"]}>
          <h3>Assigned To</h3>
          {assignedUser ? (
            <div className={styles["assignedUser"]}>
              <span>{assignedUser.name}</span>
              <button
                onClick={handleUnassignUser}
                className={styles["unassignButton"]}
                disabled={isUpdating}
              >
                Unassign
              </button>
            </div>
          ) : (
            <span className={styles["unassigned"]}>Unassigned</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={styles["actions"]}>
        <div className={styles["actionSection"]}>
          <h3>Assign User</h3>
          <div className={styles["userList"]}>
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleAssignUser(user.id)}
                className={`${styles["userButton"]} ${
                  assignedUser?.id === user.id ? styles["selected"] : ""
                }`}
                disabled={isUpdating}
              >
                {user.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles["actionSection"]}>
          <h3>Mark as {ticket.completed ? "Incomplete" : "Complete"}</h3>
          <button
            onClick={handleToggleComplete}
            className={`${styles["completeButton"]} ${
              ticket.completed ? styles["incomplete"] : styles["complete"]
            }`}
            disabled={isUpdating}
          >
            {ticket.completed ? "Mark as Incomplete" : "Mark as Complete"}
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {isUpdating && (
        <div className={styles["updatingOverlay"]}>
          <div className={styles["updatingSpinner"]}>Updating...</div>
        </div>
      )}
    </div>
  );
};

export default TicketDetails;
