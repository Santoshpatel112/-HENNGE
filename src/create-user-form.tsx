import type { CSSProperties, Dispatch, SetStateAction, FormEvent } from 'react';
import { useState, useEffect } from 'react';

interface CreateUserFormProps {
  setUserWasCreated: Dispatch<SetStateAction<boolean>>;
}

function CreateUserForm({ setUserWasCreated }: CreateUserFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password validation criteria
  const validationCriteria = [
    { id: 'length-min', test: (pwd: string) => pwd.length >= 10, message: 'Password must be at least 10 characters long' },
    { id: 'length-max', test: (pwd: string) => pwd.length <= 24, message: 'Password must be at most 24 characters long' },
    { id: 'no-spaces', test: (pwd: string) => !pwd.includes(' '), message: 'Password cannot contain spaces' },
    { id: 'has-number', test: (pwd: string) => /\d/.test(pwd), message: 'Password must contain at least one number' },
    { id: 'has-uppercase', test: (pwd: string) => /[A-Z]/.test(pwd), message: 'Password must contain at least one uppercase letter' },
    { id: 'has-lowercase', test: (pwd: string) => /[a-z]/.test(pwd), message: 'Password must contain at least one lowercase letter' },
  ];

  // Get failed validation criteria
  const failedCriteria = password ? validationCriteria.filter(criteria => !criteria.test(password)) : [];
  
  // Check if password is valid
  const isPasswordValid = failedCriteria.length === 0 && password.length > 0;
  
  // Check if form is valid
  const isFormValid = username.trim() !== '' && isPasswordValid;

  // Reset API error when form changes
  useEffect(() => {
    if (apiError) {
      setApiError(null);
    }
  }, [username, password]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Don't submit if form is invalid
    if (!isFormValid) {
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      // For the challenge, we need to get the token from the challenge-details page
      // In a real application, this would be handled differently
      // This is just a placeholder - in the actual challenge environment, 
      // you would need to use the token provided in the challenge-details page
      const token = ''; // The token should be provided by the challenge environment

      const response = await fetch('https://api.challenge.hennge.com/password-validation-challenge-api/001/challenge-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, password })
      });

      if (response.status === 200) {
        // Success - set user was created
        setUserWasCreated(true);
      } else if (response.status === 401 || response.status === 403) {
        // Unauthorized or forbidden
        setApiError('Not authenticated to access this resource.');
      } else if (response.status === 500) {
        // Generic server error
        setApiError('Something went wrong, please try again.');
      } else {
        // Check for specific validation errors
        const data = await response.json();
        
        if (data.errors && data.errors.includes('not_allowed')) {
          setApiError('Sorry, the entered password is not allowed, please try a different one.');
        } else {
          setApiError('Something went wrong, please try again.');
        }
      }
    } catch (error) {
      setApiError('Something went wrong, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={formWrapper}>
      <form style={form} onSubmit={handleSubmit}>
        <label htmlFor="username" style={formLabel}>Username</label>
        <input 
          id="username"
          name="username"
          style={formInput} 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          aria-required="true"
        />

        <label htmlFor="password" style={formLabel}>Password</label>
        <input 
          id="password"
          name="password"
          type="password"
          style={formInput} 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-required="true"
          aria-invalid={password.length > 0 && !isPasswordValid ? 'true' : 'false'}
        />

        {/* Password validation criteria */}
        {password.length > 0 && failedCriteria.length > 0 && (
          <ul style={validationList}>
            {failedCriteria.map((criteria) => (
              <li key={criteria.id} style={validationItem}>{criteria.message}</li>
            ))}
          </ul>
        )}

        {/* API error messages */}
        {apiError && <div style={errorMessage}>{apiError}</div>}

        <button 
          style={formButton} 
          type="submit" 
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
}

export { CreateUserForm };

const formWrapper: CSSProperties = {
  maxWidth: '500px',
  width: '80%',
  backgroundColor: '#efeef5',
  padding: '24px',
  borderRadius: '8px',
};

const form: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const formLabel: CSSProperties = {
  fontWeight: 700,
};

const formInput: CSSProperties = {
  outline: 'none',
  padding: '8px 16px',
  height: '40px',
  fontSize: '14px',
  backgroundColor: '#f8f7fa',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: '4px',
};

const formButton: CSSProperties = {
  outline: 'none',
  borderRadius: '4px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  backgroundColor: '#7135d2',
  color: 'white',
  fontSize: '16px',
  fontWeight: 500,
  height: '40px',
  padding: '0 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '8px',
  alignSelf: 'flex-end',
  cursor: 'pointer',
};

// Additional styles for validation and errors
const validationList: CSSProperties = {
  margin: '4px 0',
  padding: '0 0 0 20px',
  color: '#d32f2f',
};

const validationItem: CSSProperties = {
  margin: '4px 0',
};

const errorMessage: CSSProperties = {
  color: '#d32f2f',
  margin: '8px 0',
  padding: '8px',
  backgroundColor: 'rgba(211, 47, 47, 0.1)',
  borderRadius: '4px',
};
