import React, { useState } from "react";

const ServiceForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        city: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Name" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <input type="tel" placeholder="Phone" onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <select onChange={(e) => setFormData({ ...formData, city: e.target.value })}>
                <option value="">Select City</option>
                <option value="bangalore">Bangalore</option>
                <option value="mumbai">Mumbai</option>
            </select>
            <button type="submit">Submit</button>
        </form>
    );
};

export default ServiceForm;
