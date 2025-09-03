const supabase = require('../config/supabaseClient');

/**
 * Get all users with data from both Supabase Auth and custom users table
 * This joins the auth.users table with your custom users table
 */
const getAllUsers = async () => {
  try {
    // First get all users from Supabase Auth
    const { data: authUsersData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    // Extract the users array from the response
    const authUsers = authUsersData?.users || [];
    console.log('Auth users count:', authUsers.length);

    // Then get all users from your custom users table
    const { data: customUsers, error: customError } = await supabase
      .from('users')
      .select('*');
    if (customError) {
      console.log('Custom users table error (this is expected if table doesn\'t exist yet):', customError.message);
      // If custom table doesn't exist yet, just return auth users
      return authUsers.map(authUser => ({
        ...authUser,
        username: authUser.user_metadata?.username || authUser.email?.split('@')[0],
        profile_data: {},
        preferences: {}
      }));
    }

    console.log('Custom users count:', customUsers?.length || 0);

    // Create a map of custom user data by auth ID
    const customUsersMap = new Map();
    (customUsers || []).forEach(user => {
      customUsersMap.set(user.auth_id, user);
    });

    // Merge auth user data with custom user data
    const mergedUsers = authUsers.map(authUser => {
      const customUserData = customUsersMap.get(authUser.id) || {};
      return {
        ...authUser,
        // Custom user data fields
        username: customUserData.username || authUser.user_metadata?.username || authUser.email?.split('@')[0],
        profile_data: customUserData.profile_data || {},
        preferences: customUserData.preferences || {},
        created_at: customUserData.created_at || authUser.created_at,
        updated_at: customUserData.updated_at || authUser.updated_at
      };
    });

    return mergedUsers;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

/**
 * Create a user in both Supabase Auth and your custom users table
 */
const createUser = async ({ username, email, password, adminCode }) => {
  try {
    // First create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: adminCode === process.env.ADMIN_CODE ? 'admin' : 'user',
        username: username || email.split('@')[0]
      }
    });
    
    if (authError) throw authError;

    // Then create the user in your custom users table
    const { data: customUserData, error: customError } = await supabase
      .from('users')
      .insert([{
        auth_id: authData.user.id, // Link to Supabase Auth user
        username: username || email.split('@')[0],
        email: email,
        role: adminCode === process.env.ADMIN_CODE ? 'admin' : 'user',
        profile_data: {},
        preferences: {}
      }])
      .select();
    
    if (customError) throw customError;

    // Return the merged user data
    return {
      ...authData.user,
      ...customUserData[0]
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Get user by ID (can be either auth ID or custom table ID)
 */
const getUserById = async (id) => {
  try {
    // First try to get from custom users table
    let { data: customUser, error: customError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (customError && customError.code !== 'PGRST116') {
      throw customError;
    }

    // If found in custom table, get auth data too
    if (customUser) {
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(customUser.auth_id);
      if (authError) throw authError;
      
      return {
        ...authUser.user,
        ...customUser
      };
    }

    // If not found in custom table, try to get from auth by ID
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(id);
    if (authError) throw authError;
    
    // Check if there's custom data for this auth user
    const { data: customData, error: customDataError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', id)
      .single();
    
    if (customDataError && customDataError.code !== 'PGRST116') {
      throw customDataError;
    }

    return {
      ...authUser.user,
      ...(customData || {})
    };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

/**
 * Get user by email
 */
const getUserByEmail = async (email) => {
  try {
    // First try to get from custom users table
    let { data: customUser, error: customError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (customError && customError.code !== 'PGRST116') {
      throw customError;
    }

    // If found in custom table, get auth data too
    if (customUser) {
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(customUser.auth_id);
      if (authError) throw authError;
      
      return {
        ...authUser.user,
        ...customUser
      };
    }

    // If not found in custom table, try to get from auth by email
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;
    
    const authUser = authUsers.users.find(user => user.email === email);
    if (!authUser) return null;

    return authUser;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
};

module.exports = { getAllUsers, createUser, getUserById, getUserByEmail };
