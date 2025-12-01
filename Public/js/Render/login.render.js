// ====================================================
// STOCKFLOW - LOGIN RENDERS
// Login, signup, and authentication screens
// ====================================================

const LoginRenders = {

    /**
     * Main login/signup page
     */
    renderLoginPage() {
        return `
      <div class="auth-container" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div class="auth-card" style="background: white; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); padding: 40px; width: 100%; max-width: 450px; margin: 20px;">
          
          <!-- Logo/Brand -->
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
            <h1 style="margin: 0 0 8px 0; font-size: 32px; color: #1f2937;">StockFlow</h1>
            <p style="margin: 0; color: #6b7280;">Inventory Management System</p>
          </div>
          
          <!-- Login Form -->
          <div id="loginFormContainer">
            <form id="loginForm" onsubmit="app.handleLogin(event); return false;">
              <div class="form-group" style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Username</label>
                <input type="text" id="loginUsername" required 
                       style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; transition: all 0.3s;"
                       onfocus="this.style.borderColor='#667eea'"
                       onblur="this.style.borderColor='#e5e7eb'"
                       placeholder="Enter your username">
              </div>
              
              <div class="form-group" style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Password</label>
                <input type="password" id="loginPassword" required 
                       style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; transition: all 0.3s;"
                       onfocus="this.style.borderColor='#667eea'"
                       onblur="this.style.borderColor='#e5e7eb'"
                       placeholder="Enter your password">
              </div>
              
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                  <input type="checkbox " id="rememberMe" style="margin-right: 8px;">
                  <span style="font-size: 14px; color: #6b7280;">Remember me</span>
                </label>
                <a href="#" onclick="app.showForgotPassword(); return false;" style="font-size: 14px; color: #667eea; text-decoration: none;">
                  Forgot Password?
                </a>
              </div>
              
              <button type="submit" 
                      style="width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s;"
                      onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(102, 126, 234, 0.4)'"
                      onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                Login
              </button>
            </form>
            
            <div style="text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Don't have an account? 
                <a href="#" onclick="app.showSignupForm(); return false;" style="color: #667eea; text-decoration: none; font-weight: 600;">
                  Sign Up
                </a>
              </p>
            </div>
          </div>
          
          <!--  Signup Form (Hidden by default) -->
          <div id="signupFormContainer" style="display: none;">
            <!-- Signup form will be rendered here -->
          </div>
          
        </div>
      </div>
    `;
    },

    /**
     * Signup form
     */
    renderSignupForm() {
        return `
      <form id="signupForm" onsubmit="app.handleSignup(event); return false;">
        <h2 style="margin: 0 0 24px 0; text-align: center;">Create Account</h2>
        
        <div class="form-group" style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Full Name</label>
          <input type="text" id="signupFullName" required 
                 style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px;"
                 placeholder="Enter your full name">
        </div>
        
        <div class="form-group" style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Username</label>
          <input type="text" id="signupUsername" required 
                 style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px;"
                 placeholder="Choose a username">
        </div>
        
        <div class="form-group" style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Email</label>
          <input type="email" id="signupEmail" required 
                 style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px;"
                 placeholder="your.email@company.com">
        </div>
        
        <div class="form-group" style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Password</label>
          <input type="password" id="signupPassword" required 
                 style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px;"
                 placeholder="Create a strong password">
        </div>
        
        <button type="submit" 
                style="width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 8px;">
          Sign Up
        </button>
        
        <div style="text-align: center; margin-top: 16px;">
          <a href="#" onclick="app.showLoginForm(); return false;" style="color: #667eea; text-decoration: none; font-size: 14px;">
            ← Back to Login
          </a>
        </div>
      </form>
    `;
    },

    /**
     * Forgot password form
     */
    renderForgotPasswordForm() {
        return `
      <div>
        <h2 style="margin: 0 0 16px 0; text-align: center;">Reset Password</h2>
        <p style="text-align: center; color: #6b7280; margin-bottom: 24px;">Enter your email to reset your password</p>
        
        <form id="forgotPasswordForm" onsubmit="app.handleForgotPassword(event); return false;">
          <div class="form-group" style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Email Address</label>
            <input type="email" id="forgotEmail" required 
                   style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px;"
                   placeholder="your.email@company.com">
          </div>
          
          <button type="submit" 
                  style="width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">
            Send Reset Link
          </button>
          
          <div style="text-align: center; margin-top: 16px;">
            <a href="#" onclick="app.showLoginForm(); return false;" style="color: #667eea; text-decoration: none; font-size: 14px;">
              ← Back to Login
            </a>
          </div>
        </form>
      </div>
    `;
    }
};

// Export for global use
window.LoginRenders = LoginRenders;
