// Script para decodificar y verificar el JWT token de Pinata
const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlYmQ4OTYxNy0wNmQ4LTQ1ZDMtYTgwMS04YWRkMDk0OTM4ZDEiLCJlbWFpbCI6Imtldmlua3VvQGhvdG1haWwuY29tLmFyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjNiMjc3NWZkMmI3OTEwNzBhYTIiLCJzY29wZWRLZXlTZWNyZXQiOiIxNWQzYjNkZDY5ZGU1MDcxM2FlNzQ5YWZjZGI5NjE0NTliZTkyOTBhMmQwZWJmNzgxNWRlZWE0ZDVmYTBiYTY5IiwiZXhwIjoxNzg1ODY2NjUwfQ.4HFKflkM4GigAatqpJGG_opu67l-WYJNk4Wy-0fIrbY';

// Decodificar el JWT (solo la parte del payload)
const parts = jwt.split('.');
if (parts.length === 3) {
  try {
    const payload = JSON.parse(atob(parts[1]));
    console.log('JWT Payload:', JSON.stringify(payload, null, 2));
    
    // Verificar expiración
    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    
    console.log('Expiration timestamp:', exp);
    console.log('Current timestamp:', now);
    console.log('Expires on:', new Date(exp * 1000));
    console.log('Is expired?', now > exp);
    
    // Verificar scoped key
    console.log('Scoped Key:', payload.scopedKeyKey);
    console.log('Authentication Type:', payload.authenticationType);
    
  } catch (error) {
    console.error('Error decoding JWT:', error);
  }
} else {
  console.error('Invalid JWT format');
}