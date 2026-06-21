UPDATE users SET 
  password_hash = '$2b$12$X6qULbYPi8MC6eVCp4Np4OYxFn5.6nXYMTbvj99EasFbnLH0n2642',
  login_attempts = 0,
  locked_until = NULL
WHERE username = 'admin';
