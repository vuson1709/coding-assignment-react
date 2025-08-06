import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { TicketProvider } from "../context/TicketContext";
import TicketDetails from "./ticket-details";

// Mock the useParams hook
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "1" }),
  useNavigate: () => jest.fn(),
}));

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
];

const mockUsers = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

describe("TicketDetails", () => {
  beforeEach(() => {
    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
  });

  it("should render loading state initially", () => {
    // Mock fetch to return pending promises
    (global.fetch as jest.Mock)
      .mockReturnValueOnce(new Promise(() => {})) // tickets
      .mockReturnValueOnce(new Promise(() => {})); // users

    renderWithProviders(<TicketDetails />);
    expect(screen.getByText("Loading ticket details...")).toBeInTheDocument();
  });

  it("should render ticket details when data loads", async () => {
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

    renderWithProviders(<TicketDetails />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("Ticket #1")).toBeInTheDocument();
    });

    expect(screen.getByText("Install a monitor arm")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
    // Check that Alice appears (she will appear multiple times, which is expected)
    expect(screen.getAllByText("Alice")).toHaveLength(2);
  });

  it("should show error state when fetch fails", async () => {
    // Mock failed fetch
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    renderWithProviders(<TicketDetails />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it("should show ticket not found when ticket does not exist", async () => {
    // Mock successful fetch responses but with empty tickets array
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      });

    renderWithProviders(<TicketDetails />);

    await waitFor(() => {
      expect(screen.getByText("Ticket not found")).toBeInTheDocument();
    });
  });

  // Note: Additional tests would be added here for:
  // - Assigning/unassigning users
  // - Completing tickets
  // - Navigation back to list
  // These would require more complex mocking of the context and API calls
});
