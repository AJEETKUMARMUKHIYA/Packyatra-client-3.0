import React, { useState, useEffect } from "react";
import axiosClient from "../../AxiosClient";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const AssignTicket = () => {
  const [tickets, setTickets] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [assignedSupervisors, setAssignedSupervisors] = useState({}); // Track ticket-to-supervisor assignments
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Fetch tickets and supervisors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsResponse, supervisorsResponse] = await Promise.all([
         // axios.get("https://localhost:7148/api/Booking/Tickets"),
          //axios.get("https://localhost:7148/api/Booking/Supervisors"),

             axiosClient.get("/Booking/Tickets"),
          axiosClient.get("/Booking/Supervisors"),
        ]);

        setTickets(ticketsResponse.data);
        setSupervisors(supervisorsResponse.data);

        // Initialize assigned supervisors from fetched tickets
        const initialAssigned = {};
        ticketsResponse.data.forEach((ticket) => {
          if (ticket.assignedSupervisorID) {
            initialAssigned[ticket.ticketID] = ticket.assignedSupervisorID;
          }
        });
        setAssignedSupervisors(initialAssigned);
      } catch (error) {
        console.error("Fetch error:", error.response?.data || error.message);
        setSnackbar({
          open: true,
          message: "Failed to fetch data: " + (error.response?.data?.message || error.message),
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle supervisor assignment
  const handleAssignSupervisor = async (ticketId, supervisorId) => {
    try {
      // const response = await axios.put(
      //   `https://localhost:7148/api/Booking/AssignTicket/${ticketId}`,
      //   { TicketID: ticketId, SupervisorID: supervisorId },
      //   { headers: { "Content-Type": "application/json" } }
      // );

         const response = await axiosClient.put(
        `/Booking/AssignTicket/${ticketId}`,
        { TicketID: ticketId, SupervisorID: supervisorId },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Assign response:", response.data);

      // Update ticket state locally
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.ticketID === ticketId
            ? { ...ticket, assignedSupervisorID: supervisorId }
            : ticket
        )
      );

      // Update assigned supervisors
      setAssignedSupervisors((prev) => ({
        ...prev,
        [ticketId]: supervisorId,
      }));

      setSnackbar({
        open: true,
        message: `Ticket ${ticketId} assigned successfully`,
        severity: "success",
      });
    } catch (error) {
      console.error("Assign error:", error.response?.data || error.message);
      setSnackbar({
        open: true,
        message: "Failed to assign ticket: " + (error.response?.data?.message || error.message),
        severity: "error",
      });
      throw error; // Rethrow to prevent state updates on failure
    }
  };

  // Handle supervisor unassignment
  const handleUnassignSupervisor = async (ticketId) => {
    try {
      // const response = await axios.put(
      //   `https://localhost:7148/api/Booking/AssignTicket/${ticketId}`,
      //   { TicketID: ticketId, SupervisorID: 0 }, // Assuming 0 means unassigned
      //   { headers: { "Content-Type": "application/json" } }
      // );

        const response = await axiosClient.put(
        `/Booking/AssignTicket/${ticketId}`,
        { TicketID: ticketId, SupervisorID: 0 }, // Assuming 0 means unassigned
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Unassign response:", response.data);

      // Update ticket state locally
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.ticketID === ticketId ? { ...ticket, assignedSupervisorID: null } : ticket
        )
      );

      // Update assigned supervisors
      setAssignedSupervisors((prev) => {
        const updated = { ...prev };
        delete updated[ticketId];
        return updated;
      });

      setSnackbar({
        open: true,
        message: `Ticket ${ticketId} unassigned successfully`,
        severity: "success",
      });
    } catch (error) {
      console.error("Unassign error:", error.response?.data || error.message);
      setSnackbar({
        open: true,
        message: "Failed to unassign ticket: " + (error.response?.data?.message || error.message),
        severity: "error",
      });
      throw error; // Rethrow to prevent state updates on failure
    }
  };

  // Get available supervisors for a ticket
  const getAvailableSupervisors = () => {
    return supervisors; // Return all supervisors, allowing assignment to multiple tickets
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Assign Tickets to Supervisors
      </Typography>
      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><Typography fontWeight="bold">Ticket No</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Booking ID</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">From</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">To</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Status</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Supervisor</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Action</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.ticketID}>
                <TableCell>{ticket.ticketNo}</TableCell>
                <TableCell>{ticket.bookingID}</TableCell>
                <TableCell>{ticket.fromLocation}</TableCell>
                <TableCell>{ticket.toLocation}</TableCell>
                <TableCell>{ticket.status}</TableCell>
                <TableCell>
                  <Autocomplete
                    options={getAvailableSupervisors()}
                    getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                    value={supervisors.find((s) => s.userId === ticket.assignedSupervisorID) || null}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        handleAssignSupervisor(ticket.ticketID, newValue.userId);
                      } else {
                        handleUnassignSupervisor(ticket.ticketID);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Supervisor" size="small" />
                    )}
                    sx={{ minWidth: 200 }}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleUnassignSupervisor(ticket.ticketID)}
                    disabled={!ticket.assignedSupervisorID} // Disable if no supervisor assigned
                    sx={{ borderRadius: 1 }}
                  >
                    Unassign
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssignTicket;