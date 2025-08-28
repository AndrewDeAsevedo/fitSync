const supabase = require('../config/supabaseClient');

const getAllUsers = async () => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data;
};

const createUser = async ({ name, email }) => {
  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email }])
    .select();
  if (error) throw error;
  return data[0];
};

module.exports = { getAllUsers, createUser };
