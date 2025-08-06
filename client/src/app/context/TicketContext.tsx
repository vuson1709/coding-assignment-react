import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Ticket, User } from "@acme/shared-models";

// Define the context interface
interface TicketContextType {
  tickets: Ticket[];
  users: User[];
  loading: boolean;
  error: string | null;

  // Ticket operations
  createTicket: (description: string) => Promise<void>;
  assignTicket: (ticketId: number, userId: number) => Promise<void>;
  unassignTicket: (ticketId: number) => Promise<void>;
  completeTicket: (ticketId: number, completed: boolean) => Promise<void>;

  // Helper functions
  getUserById: (userId: number | null) => User | null;
  getTicketById: (ticketId: number) => Ticket | null;
}

// Create the context
const TicketContext = createContext<TicketContextType | undefined>(undefined);

// Custom hook to use the ticket context
export const useTicketContext = () => {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error("useTicketContext must be used within a TicketProvider");
  }
  return context;
};

// Provider component
interface TicketProviderProps {
  children: ReactNode;
}

export const TicketProvider: React.FC<TicketProviderProps> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tickets and users in parallel
        const [ticketsResponse, usersResponse] = await Promise.all([
          fetch("/api/tickets"),
          fetch("/api/users"),
        ]);

        if (!ticketsResponse.ok || !usersResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const [ticketsData, usersData] = await Promise.all([
          ticketsResponse.json(),
          usersResponse.json(),
        ]);

        setTickets(ticketsData);
        setUsers(usersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Create a new ticket
  const createTicket = async (description: string) => {
    try {
      setError(null);
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error("Failed to create ticket");
      }

      const newTicket = await response.json();
      setTickets((prev) => [...prev, newTicket]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
      throw err;
    }
  };

  // Assign a user to a ticket
  const assignTicket = async (ticketId: number, userId: number) => {
    try {
      setError(null);
      const response = await fetch(`/api/tickets/${ticketId}/assign/${userId}`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Failed to assign ticket");
      }

      // Update the ticket in local state
      setTickets((prev) =>
        prev.map((ticket) => (ticket.id === ticketId ? { ...ticket, assigneeId: userId } : ticket))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign ticket");
      throw err;
    }
  };

  // Unassign a user from a ticket
  const unassignTicket = async (ticketId: number) => {
    try {
      setError(null);
      const response = await fetch(`/api/tickets/${ticketId}/unassign`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Failed to unassign ticket");
      }

      // Update the ticket in local state
      setTickets((prev) =>
        prev.map((ticket) => (ticket.id === ticketId ? { ...ticket, assigneeId: null } : ticket))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unassign ticket");
      throw err;
    }
  };

  // Complete or uncomplete a ticket
  const completeTicket = async (ticketId: number, completed: boolean) => {
    try {
      setError(null);
      const response = await fetch(`/api/tickets/${ticketId}/complete`, {
        method: completed ? "PUT" : "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to ${completed ? "complete" : "uncomplete"} ticket`);
      }

      // Update the ticket in local state
      setTickets((prev) =>
        prev.map((ticket) => (ticket.id === ticketId ? { ...ticket, completed } : ticket))
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${completed ? "complete" : "uncomplete"} ticket`
      );
      throw err;
    }
  };

  // Helper function to get user by ID
  const getUserById = (userId: number | null): User | null => {
    if (userId === null) return null;
    return users.find((user) => user.id === userId) || null;
  };

  // Helper function to get ticket by ID
  const getTicketById = (ticketId: number): Ticket | null => {
    return tickets.find((ticket) => ticket.id === ticketId) || null;
  };

  const value: TicketContextType = {
    tickets,
    users,
    loading,
    error,
    createTicket,
    assignTicket,
    unassignTicket,
    completeTicket,
    getUserById,
    getTicketById,
  };

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
};
