// frontend/src/components/HelloUserService.js
import React, { useEffect, useState } from 'react';
import { fetchUserServiceHello } from '../services/api';

function HelloUserService() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUserServiceHello().then(data => setMessage(data));
  }, []);

  return <div>{message}</div>;
}

export default HelloUserService;
