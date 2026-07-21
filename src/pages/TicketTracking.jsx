import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Divider, Stepper, Step, StepLabel } from "@mui/material";
import axios from "axios";
import AxiosClient from "../AxiosClient";
const TicketTracking = ({ bookingID }) => {
  const [ticket, setTicket] = useState(null);
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    // Fetch Ticket Details
       // axios.get(`/api/ticket/${bookingID}`)
    AxiosClient.get(`/ticket/${bookingID}`)
      .then((response) => {
        setTicket(response.data.ticket);
        setUpdates(response.data.updates);
      })
      .catch((error) => console.error("Error fetching ticket:", error));
  }, [bookingID]);

  if (!ticket) return <Typography>Loading ticket details...</Typography>;

  const statusSteps = ["Pending Pickup", "Pickup Scheduled", "In Transit", "Delivered"];
  const activeStep = statusSteps.indexOf(ticket.Status);

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", textAlign: "center" }}>
        Tracking ID: {ticket.TicketID}
      </Typography>

      <Paper sx={{ p: 3, mt: 2, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="body1">
          <strong>From:</strong> {ticket.FromLocation}
        </Typography>
        <Typography variant="body1">
          <strong>To:</strong> {ticket.ToLocation}
        </Typography>
        <Typography variant="body1">
          <strong>Booking Amount:</strong> ₹ {ticket.BookingAmount}
        </Typography>
        <Typography variant="body1">
          <strong>Assigned Supervisor:</strong> {ticket.AssignedSupervisorID ? `Supervisor ${ticket.AssignedSupervisorID}` : "Not Assigned"}
        </Typography>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Stepper activeStep={activeStep} alternativeLabel>
        {statusSteps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">Status Updates</Typography>
        {updates.map((update, index) => (
          <Paper key={index} sx={{ p: 2, my: 1, borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="body2"><strong>{update.Status}</strong></Typography>
            <Typography variant="caption" color="text.secondary">{new Date(update.UpdateTimestamp).toLocaleString()}</Typography>
            {update.Notes && <Typography variant="body2" sx={{ mt: 1 }}>{update.Notes}</Typography>}
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default TicketTracking;
