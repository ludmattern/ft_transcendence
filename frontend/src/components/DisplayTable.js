// frontend/src/components/DisplayTable.js
import React, { useEffect, useState } from 'react';

function DisplayTable() {
  const [users, setUsers] = useState([]);       // État pour stocker les données des utilisateurs
  const [loading, setLoading] = useState(true);  // État pour gérer le chargement
  const [error, setError] = useState(null);      // État pour gérer les erreurs

  useEffect(() => {
    // Fonction pour récupérer les utilisateurs
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/user-service/users'); // Endpoint du service backend
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }
        const data = await response.json();
        setUsers(data); // Mise à jour de l'état des utilisateurs
      } catch (err) {
        setError(err.message); // Gestion de l'erreur
      } finally {
        setLoading(false); // Fin du chargement
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p>Chargement des données...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div>
      <h2>Liste des utilisateurs</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom d'utilisateur</th>
            <th>Email</th>
            <th>2FA activé</th>
            <th>Date de création</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.is_2fa_enabled ? 'Oui' : 'Non'}</td>
              <td>{new Date(user.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DisplayTable;
