import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { TicketProvider } from "../context/TicketContext";
import Tickets from "./tickets";

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <TicketProvider>{component}</TicketProvider>
    </BrowserRouter>
  );
};

// Mock data
const mockTickets = [
  {
    id: 1,
    description: "Install a monitor arm",
    assigneeId: 1,
    completed: false,
  },
  {
    id: 2,
    description: "Move the desk to the new location",
    assigneeId: null,
    completed: true,
  },
];

const mockUsers = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

describe("Tickets", () => {
  beforeEach(() => {
    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
  });

  it("should render loading state initially", () => {
    // Mock fetch to return pending promises
    (global.fetch as jest.Mock)
      .mockReturnValueOnce(new Promise(() => {})) // tickets
      .mockReturnValueOnce(new Promise(() => {})); // users

    renderWithProviders(<Tickets />);
    expect(screen.getByText("Loading tickets...")).toBeInTheDocument();
  });

  it("should render successfully with data", async () => {
    // Mock successful fetch responses
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTickets,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      });

    renderWithProviders(<Tickets />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("Tickets (2)")).toBeInTheDocument();
    });

    expect(screen.getByText("+ Add Ticket")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter by status:")).toBeInTheDocument();
  });

  it("should show error state when fetch fails", async () => {
    // Mock failed fetch
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    renderWithProviders(<Tickets />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  // Note: Additional tests would be added here for:
  // - Creating tickets
  // - Filtering functionality
  // - Navigation to details
  // These would require more complex mocking of the context and API calls
});
