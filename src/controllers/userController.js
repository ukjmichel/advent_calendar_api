const { db } = require('../../db');

const getAllProfiles = async (req, res) => {
  try {
    const query = 'SELECT * FROM users';
    const [rows] = await db.execute(query);

    res.status(200).json({
      message: 'All users retrieved successfully',
      data: rows,
    });
  } catch (error) {
    console.error('Error retrieving all profiles:', error);
    res.status(500).json({
      message: 'Failed to retrieve user profiles',
      error: error.message,
    });
  }
};

const getUsernameById = async (req, res) => {
  const id = req.params.id;
  try {
    const query = 'SELECT username FROM users WHERE id = ?';
    const [rows] = await db.execute(query, [id]);

    if (rows.length === 0) {
      // No user found with the given ID.
      return res.status(404).json({
        message: 'No username found for the given ID',
      });
    }

    // User found, return the username.
    res.status(200).json({
      message: 'Username found',
      username: rows[0].username,
    });
  } catch (error) {
    console.error('Error retrieving username:', error);
    res.status(500).json({
      message: 'Failed to retrieve username',
      error: error.message,
    });
  }
};

const getProfile = (req, res) => {
  res.status(200).json({ message: 'Profile data', user: req.user });
};

const deleteAccount = async (req, res) => {
  const userId = `${req.user.id}`;
  try {
    // Delete the user from the database.
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    res
      .status(200)
      .json({ message: `Account with id ${userId} deleted successfully` });
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllProfiles,
  getUsernameById,
  getProfile,
  deleteAccount,
};
