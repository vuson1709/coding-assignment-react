import { Routes, Route } from "react-router-dom";

import styles from "./app.module.css";
import { TicketProvider } from "./context/TicketContext";
import Tickets from "./tickets/tickets";
import TicketDetails from "./ticket-details/ticket-details";

const App = () => {
  return (
    <TicketProvider>
      <div className={styles["app"]}>
        <h1>Ticketing App</h1>
        <Routes>
          <Route path='/' element={<Tickets />} />
          <Route path='/:id' element={<TicketDetails />} />
        </Routes>
      </div>
    </TicketProvider>
  );
};

export default App;
