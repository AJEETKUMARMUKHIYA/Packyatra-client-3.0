import axios from "axios";

const api = axios.create({
    baseURL: "https://api.example.com",
});

export const fetchServices = async () => await api.get("/services");
export const submitForm = async (data) => await api.post("/form", data);
