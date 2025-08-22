class FeedbackModal {
  constructor() {
    this.modal = null;
    this.successMessage = null;
    this.formContainer = null;
    this.form = null;
    this.currentStep = 1;
    this.totalSteps = 5;
    this.answers = {};
    this.formData = {};
    this.skipToStep = null;
  }

  // Initialize
  init() {
    this.modal = document.getElementById('feedbackModal');
    this.successMessage = document.getElementById('feedbackSuccessMessage');
    this.formContainer = document.getElementById('feedback-form-container');
    this.form = document.getElementById('feedback-form');

    this.bindEvents();
    this.checkSubmissionStatus();
  }

  // Open modal
  open() {
    if (this.modal) {
      this.modal.setAttribute('open', '');
      this.resetForm();
      this.goToStep(1);
      
      // Focus management
      setTimeout(() => {
        const firstInput = this.modal.querySelector('input, textarea, button');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  }

  // Close modal
  close() {
    if (this.modal) {
      this.modal.removeAttribute('open');
      this.hideSuccess();
    }
  }

  // Reset form to initial state
  resetForm() {
    if (this.form) {
      this.form.reset();
    }
    this.currentStep = 1;
    this.answers = {};
    this.formData = {};
    this.clearAllErrors();
    this.hideSuccess();
  }

  // Go to specific step
  goToStep(stepNumber) {
    // Hide all steps
    const allSteps = this.form?.querySelectorAll('.feedback-step');
    if (allSteps) {
      allSteps.forEach(step => step.style.display = 'none');
    }

    // Show target step
    const targetStep = document.getElementById(`step-${stepNumber}`);
    if (targetStep) {
      targetStep.style.display = 'block';
      this.currentStep = stepNumber;
      
      // Update progress indicator
      this.updateProgressIndicator();
      
      // Focus on first input in the step
      setTimeout(() => {
        const firstInput = targetStep.querySelector('input, textarea, select');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  }

  // Update progress indicator
  updateProgressIndicator() {
    const progressDots = document.querySelectorAll('.progress-dot');
    progressDots.forEach((dot, index) => {
      dot.classList.remove('active', 'completed');
      if (index + 1 < this.currentStep) {
        dot.classList.add('completed');
      } else if (index + 1 === this.currentStep) {
        dot.classList.add('active');
      }
    });
  }

  // Clear all errors
  clearAllErrors() {
    const errorMessages = this.form?.querySelectorAll('.error-message');
    if (errorMessages) {
      errorMessages.forEach(error => {
        error.classList.remove('show');
      });
    }

    const errorInputs = this.form?.querySelectorAll('.error');
    if (errorInputs) {
      errorInputs.forEach(input => {
        input.classList.remove('error');
      });
    }
  }

  // Clear specific error
  clearError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.classList.remove('show');
    }
  }

  // Show error
  showError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.classList.add('show');
    }
  }

  // Show success message
  showSuccess() {
    if (this.successMessage && this.formContainer) {
      this.formContainer.style.display = 'none';
      this.successMessage.classList.add('show');
    }
  }

  // Hide success message
  hideSuccess() {
    if (this.successMessage && this.formContainer) {
      this.successMessage.classList.remove('show');
      this.formContainer.style.display = 'block';
    }
  }

  // Close success message
  closeSuccess() {
    this.close();
  }

  // Check submission status
  checkSubmissionStatus() {
    if (localStorage.getItem('feedback_form_submitted') === 'true') {
      this.showSubmissionSuccess();
      localStorage.removeItem('feedback_form_submitted');
    }
  }

  // Check if form has verification elements
  hasVerificationElements() {
    const verificationKeywords = ['verification', 'verify', 'confirm', 'check'];
    const hasVerificationKeywords = verificationKeywords.some(keyword => 
      document.body.textContent.toLowerCase().includes(keyword)
    );

    const verificationElements = document.querySelectorAll('[data-verification], .verification, #verification');
    const hasVerificationElements = verificationElements.length > 0;

    const visibleErrorMessages = Array.from(document.querySelectorAll('.error-message')).some(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetHeight > 0;
    });

    return hasVerificationKeywords || hasVerificationElements || visibleErrorMessages;
  }

  // Show submission success popup
  showSubmissionSuccess() {
    this.open();
    this.showSuccess();
  }

  // Bind events
  bindEvents() {
    // Feedback button click event
    const feedbackButton = document.getElementById('feedbackButton');
    if (feedbackButton) {
      feedbackButton.addEventListener('click', () => this.open());
    }

    // Close button event
    const closeBtn = this.modal?.querySelector('.modal__close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Click background to close
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
    }

    // Form submit event
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        if (!this.validateCurrentStep()) {
          e.preventDefault();
          return false;
        }

        this.collectAllAnswers();
        this.prepareFormSubmission();
        this.setLoadingState(true);
        localStorage.setItem('feedback_form_submitted', 'true');
        return true;
      });
    }

    // Step navigation events
    this.bindStepEvents();

    // Rating selection event
    const ratingInputs = this.form?.querySelectorAll('input[name="contact[rating]"]');
    if (ratingInputs) {
      ratingInputs.forEach((input) => {
        input.addEventListener('change', () => {
          this.clearError('rating-error');
          this.toggleReportIssueSection();
        });
      });
    }

    // Issue selection events
    const issueCheckboxes = this.form?.querySelectorAll('input[name="contact[issues]"]');
    if (issueCheckboxes) {
      issueCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
          this.handleIssueSelection();
        });
      });
    }

    // Email input events
    const emailInputs = this.form?.querySelectorAll('input[type="email"]');
    if (emailInputs) {
      emailInputs.forEach((input) => {
        input.addEventListener('input', () => {
          const errorId = input.id.replace(/[^a-zA-Z0-9]/g, '') + '-error';
          this.clearError(errorId);
        });
      });
    }

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal?.hasAttribute('open')) {
        this.close();
      }
    });
  }

  // Bind step navigation events
  bindStepEvents() {
    // Q1 Next
    const q1Next = document.getElementById('q1-next');
    if (q1Next) {
      q1Next.addEventListener('click', () => {
        if (this.validateStep1()) {
          this.saveStepAnswers(1);
          this.goToStep(2);
        }
      });
    }

    // Q2 Navigation
    const q2Back = document.getElementById('q2-back');
    const q2Next = document.getElementById('q2-next');
    if (q2Back) {
      q2Back.addEventListener('click', () => this.goToStep(1));
    }
    if (q2Next) {
      q2Next.addEventListener('click', () => {
        this.saveStepAnswers(2);
        this.handleQ2Navigation();
      });
    }

    // Q3 Navigation
    const q3Back = document.getElementById('q3-back');
    const q3Next = document.getElementById('q3-next');
    if (q3Back) {
      q3Back.addEventListener('click', () => this.goToPreviousStep());
    }
    if (q3Next) {
      q3Next.addEventListener('click', () => {
        this.saveStepAnswers(3);
        this.goToNextStep();
      });
    }

    // Q4 Navigation
    const q4Back = document.getElementById('q4-back');
    const q4Next = document.getElementById('q4-next');
    if (q4Back) {
      q4Back.addEventListener('click', () => this.goToPreviousStep());
    }
    if (q4Next) {
      q4Next.addEventListener('click', () => {
        if (this.validateQ4()) {
          this.saveStepAnswers(4);
          this.goToNextStep();
        }
      });
    }

    // Q5 Navigation
    const q5Back = document.getElementById('q5-back');
    const q5Submit = document.getElementById('q5-submit');
    if (q5Back) {
      q5Back.addEventListener('click', () => this.goToPreviousStep());
    }
    if (q5Submit) {
      q5Submit.addEventListener('click', () => {
        this.saveStepAnswers(5);
        this.handleFinalSubmission();
      });
    }

    // Bug report navigation
    const bugBack = document.getElementById('bug-back');
    const bugSubmit = document.getElementById('bug-submit');
    if (bugBack) {
      bugBack.addEventListener('click', () => this.goToPreviousStep());
    }
    if (bugSubmit) {
      bugSubmit.addEventListener('click', () => {
        if (this.validateBugReport()) {
          this.saveStepAnswers('bug-report');
          this.handleFinalSubmission();
        }
      });
    }

    // Final step navigation
    const finalBack = document.getElementById('final-back');
    const finalSubmit = document.getElementById('final-submit');
    if (finalBack) {
      finalBack.addEventListener('click', () => this.goToPreviousStep());
    }
  }

  // Handle Q2 navigation based on selected issues
  handleQ2Navigation() {
    const selectedIssues = Array.from(this.form.querySelectorAll('input[name="contact[issues]"]:checked'))
      .map(input => input.value);
    
    if (selectedIssues.length === 0) {
      this.showError('issues-error');
      return false;
    }
    
    // Check for specific routing
    if (selectedIssues.includes('find_local_dealer')) {
      this.openDealerMap();
      return true;
    }
    
    if (selectedIssues.includes('incomplete_product_info')) {
      this.goToStep(3);
      return true;
    }
    
    if (selectedIssues.includes('live_chat_failed')) {
      this.goToStep(4);
      return true;
    }
    
    if (selectedIssues.includes('technical_bug')) {
      this.showBugReportForm();
      return true;
    }
    
    if (selectedIssues.includes('navigation_issues')) {
      this.goToStep(5);
      return true;
    }
    
    if (selectedIssues.includes('others')) {
      this.goToStep('final');
      return true;
    }
    
    // Default to next step
    this.goToStep(3);
    return true;
  }

  // Open dealer map
  openDealerMap() {
    const dealerMapUrl = '/pages/dealers';
    window.open(dealerMapUrl, '_blank');
    this.close();
  }

  // Show bug report form with pre-filled data
  showBugReportForm() {
    this.showStep('bug-report');
    // Pre-fill some technical information
    const bugDetails = document.getElementById('bug_description');
    if (bugDetails) {
      bugDetails.value = `Browser: ${navigator.userAgent}\nURL: ${window.location.href}\nTimestamp: ${new Date().toISOString()}\n\nPlease describe the issue:`;
    }
  }

  // Show specific step
  showStep(stepId) {
    // Hide all steps
    const allSteps = this.form.querySelectorAll('.feedback-step');
    allSteps.forEach(step => step.style.display = 'none');
    
    // Show target step
    const targetStep = document.getElementById(`step-${stepId}`);
    if (targetStep) {
      targetStep.style.display = 'block';
      this.currentStep = stepId;
      
      // Focus on first input in the step
      setTimeout(() => {
        const firstInput = targetStep.querySelector('input, textarea, select');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  }

  // Go back to previous step
  goBack() {
    const stepOrder = ['q1', 'q2', 'q3', 'q4', 'q5', 'bug-report', 'final'];
    const currentIndex = stepOrder.indexOf(this.currentStep);
    
    if (currentIndex > 0) {
      this.showStep(stepOrder[currentIndex - 1]);
    }
  }

  // Validate step 1
  validateStep1() {
    return this.validateQ1();
  }

  // Validate current step
  validateCurrentStep() {
    switch (this.currentStep) {
      case 1:
      case 'q1':
        return this.validateQ1();
      case 2:
      case 'q2':
        return this.validateQ2();
      case 3:
      case 'q3':
        return this.validateQ3();
      case 4:
      case 'q4':
        return this.validateQ4();
      case 5:
      case 'q5':
        return this.validateQ5();
      case 'bug-report':
        return this.validateBugReport();
      case 'final':
        return this.validateFinal();
      default:
        return true;
    }
  }

  // Validate Q1 (rating)
  validateQ1() {
    const rating = this.form.querySelector('input[name="contact[rating]"]:checked');
    if (!rating) {
      this.showError('rating-error');
      return false;
    }
    
    this.formData.rating = rating.value;
    
    // Show issue report field if rating < 4
    if (parseInt(rating.value) < 4) {
      const issueReport = document.getElementById('report-issue-section');
      if (issueReport) {
        issueReport.style.display = 'block';
      }
    }
    
    return true;
  }

  // Validate Q2 (issues)
  validateQ2() {
    const selectedIssues = this.form.querySelectorAll('input[name="contact[issues]"]:checked');
    if (selectedIssues.length === 0) {
      this.showError('issues-error');
      return false;
    }
    return true;
  }

  // Validate Q3 (product info)
  validateQ3() {
    // Q3 is optional, always return true
    return true;
  }

  // Validate Q4 (live chat)
  validateQ4() {
    const email = document.getElementById('contact_email_q4');
    if (!email || !email.value.trim()) {
      this.showError('email-q4-error');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
      this.showError('email-q4-error');
      return false;
    }
    
    return true;
  }

  // Validate Q5 (mobile UX)
  validateQ5() {
    // Q5 is optional, always return true
    return true;
  }

  // Validate bug report
  validateBugReport() {
    const bugDetails = document.getElementById('bug_description');
    const bugEmail = document.getElementById('bug_email');
    
    if (!bugDetails || !bugDetails.value.trim()) {
      this.showError('bug-description-error');
      return false;
    }
    
    if (!bugEmail || !bugEmail.value.trim()) {
      this.showError('bug-email-error');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bugEmail.value)) {
      this.showError('bug-email-error');
      return false;
    }
    
    this.formData.bugDetails = bugDetails.value;
    this.formData.bugEmail = bugEmail.value;
    
    return true;
  }

  // Validate final step
  validateFinal() {
    const finalEmail = document.getElementById('final_email');
    
    if (!finalEmail || !finalEmail.value.trim()) {
      this.showError('final-email-error');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(finalEmail.value)) {
      this.showError('final-email-error');
      return false;
    }
    
    this.formData.finalEmail = finalEmail.value;
    
    const finalMessage = document.getElementById('final_message');
    if (finalMessage) {
      this.formData.finalMessage = finalMessage.value;
    }
    
    return true;
  }

  // Toggle report issue section based on rating
  toggleReportIssueSection() {
    const rating = this.form.querySelector('input[name="contact[rating]"]:checked');
    const reportSection = document.getElementById('report-issue-section');
    
    if (rating && reportSection) {
      if (parseInt(rating.value) < 4) {
        reportSection.style.display = 'block';
      } else {
        reportSection.style.display = 'none';
      }
    }
  }

  // Handle issue selection
  handleIssueSelection() {
    const othersCheckbox = document.getElementById('issue_6');
    const othersInput = document.getElementById('others-input');
    
    if (othersCheckbox && othersInput) {
      if (othersCheckbox.checked) {
        othersInput.style.display = 'block';
      } else {
        othersInput.style.display = 'none';
      }
    }
  }

  // Save step answers
  saveStepAnswers(step) {
    switch (step) {
      case 1:
        const rating = this.form.querySelector('input[name="contact[rating]"]:checked');
        if (rating) {
          this.formData.rating = rating.value;
        }
        
        const reportIssue = document.getElementById('report_issue');
        if (reportIssue && reportIssue.value.trim()) {
          this.formData.issueReport = reportIssue.value;
        }
        break;
        
      case 2:
        const selectedIssues = Array.from(this.form.querySelectorAll('input[name="contact[issues]"]:checked'))
          .map(input => input.value);
        this.formData.issues = selectedIssues;
        
        const otherIssue = document.getElementById('other_issue');
        if (otherIssue && otherIssue.value.trim()) {
          this.formData.otherIssue = otherIssue.value;
        }
        break;
        
      case 3:
        const missingInfo = document.getElementById('missing_info');
        if (missingInfo) {
          this.formData.productInfo = missingInfo.value;
        }
        
        const followupEmail = document.getElementById('followup_email_q3');
        if (followupEmail) {
          this.formData.productInfoEmail = followupEmail.value;
        }
        break;
        
      case 4:
        const unansweredQuestion = document.getElementById('unanswered_question');
        if (unansweredQuestion) {
          this.formData.chatQuestion = unansweredQuestion.value;
        }
        
        const contactEmail = document.getElementById('contact_email_q4');
        if (contactEmail) {
          this.formData.chatEmail = contactEmail.value;
        }
        break;
        
      case 5:
        const selectedUXIssues = Array.from(this.form.querySelectorAll('input[name="contact[ux_issues]"]:checked'))
          .map(input => input.value);
        this.formData.mobileDifficulties = selectedUXIssues;
        
        const uxOtherIssue = document.getElementById('ux_other_issue');
        if (uxOtherIssue && uxOtherIssue.value.trim()) {
          this.formData.mobileOther = uxOtherIssue.value;
        }
        break;
        
      case 'bug-report':
        const bugDescription = document.getElementById('bug_description');
        if (bugDescription) {
          this.formData.bugDetails = bugDescription.value;
        }
        
        const bugEmail = document.getElementById('bug_email');
        if (bugEmail) {
          this.formData.bugEmail = bugEmail.value;
        }
        break;
    }
  }

  // Collect all answers
  collectAllAnswers() {
    this.saveStepAnswers(this.currentStep);
  }

  // Prepare form submission
  prepareFormSubmission() {
    this.prepareFinalFormSubmission();
  }

  // Set loading state
  setLoadingState(loading) {
    const submitButtons = this.form.querySelectorAll('button[type="submit"]');
    submitButtons.forEach(button => {
      if (loading) {
        button.disabled = true;
        button.textContent = 'Submitting...';
      } else {
        button.disabled = false;
        button.textContent = 'Submit';
      }
    });
  }

  // Go to previous step
  goToPreviousStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }

  // Go to next step
  goToNextStep() {
    if (this.currentStep < this.totalSteps) {
      this.goToStep(this.currentStep + 1);
    } else {
      this.goToStep('final');
    }
  }

  // Handle final submission
  handleFinalSubmission() {
    // Check if we have an email from previous steps
    const hasEmail = this.formData.chatEmail || this.formData.productInfoEmail || this.formData.bugEmail;
    
    if (!hasEmail) {
      // Go to final step to collect email
      this.goToStep('final');
    } else {
      // Submit the form
      this.form.submit();
    }
  }

  // Prepare final form submission
  prepareFinalFormSubmission() {
    const emailMessage = this.buildComprehensiveEmailMessage();
    
    // Set hidden form fields
    this.setHiddenField('contact[subject]', 'Multi-stage User Experience Feedback');
    this.setHiddenField('contact[body]', emailMessage);
    
    // Set email from the most recent step
    const email = this.formData.finalEmail || this.formData.bugEmail || this.formData.chatEmail || this.formData.productInfoEmail;
    if (email) {
      this.setHiddenField('contact[email]', email);
    }
    
    // Set name if available
    this.setHiddenField('contact[name]', 'Feedback User');
    
    // Set return URL
    this.setHiddenField('return_to', window.location.href);
  }

  // Set hidden field value
  setHiddenField(name, value) {
    let field = this.form.querySelector(`input[name="${name}"]`);
    if (!field) {
      field = document.createElement('input');
      field.type = 'hidden';
      field.name = name;
      this.form.appendChild(field);
    }
    field.value = value;
  }

  // Build comprehensive email message
  buildComprehensiveEmailMessage() {
    const timestamp = new Date().toLocaleString();
    const currentUrl = window.location.href;
    
    let message = `Multi-stage User Experience Feedback\n\n`;
    message += `Submission Time: ${timestamp}\n`;
    message += `Page URL: ${currentUrl}\n\n`;
    
    // Q1 - Rating
    if (this.formData.rating) {
      const ratingText = this.getRatingText(this.formData.rating);
      message += `Q1 - Experience Rating: ${this.formData.rating}/5 (${ratingText})\n`;
      
      if (parseInt(this.formData.rating) < 4 && this.formData.issueReport) {
        message += `Issue Report: ${this.formData.issueReport}\n`;
      }
      message += `\n`;
    }
    
    // Q2 - Issues
    if (this.formData.issues && this.formData.issues.length > 0) {
      message += `Q2 - Issues Encountered:\n`;
      this.formData.issues.forEach(issue => {
        const issueText = this.getIssueText(issue);
        message += `- ${issueText}\n`;
      });
      if (this.formData.otherIssue) {
        message += `- Other: ${this.formData.otherIssue}\n`;
      }
      message += `\n`;
    }
    
    // Q3 - Product Info
    if (this.formData.productInfo) {
      message += `Q3 - Missing Product Information:\n${this.formData.productInfo}\n`;
      if (this.formData.productInfoEmail) {
        message += `Contact Email: ${this.formData.productInfoEmail}\n`;
      }
      message += `\n`;
    }
    
    // Q4 - Live Chat
    if (this.formData.chatQuestion) {
      message += `Q4 - Live Chat Issue:\n${this.formData.chatQuestion}\n`;
      message += `Contact Email: ${this.formData.chatEmail}\n\n`;
    }
    
    // Q5 - Mobile UX
    if (this.formData.mobileDifficulties && this.formData.mobileDifficulties.length > 0) {
      message += `Q5 - Mobile Usage Difficulties:\n`;
      this.formData.mobileDifficulties.forEach(difficulty => {
        const difficultyText = this.getMobileDifficultyText(difficulty);
        message += `- ${difficultyText}\n`;
      });
      if (this.formData.mobileOther) {
        message += `- Other: ${this.formData.mobileOther}\n`;
      }
      message += `\n`;
    }
    
    // Bug Report
    if (this.formData.bugDetails) {
      message += `Technical Issue Report:\n${this.formData.bugDetails}\n`;
      message += `Contact Email: ${this.formData.bugEmail}\n\n`;
    }
    
    // Final Message
    if (this.formData.finalMessage) {
      message += `Additional Comments:\n${this.formData.finalMessage}\n\n`;
    }
    
    message += `---\nGenerated by Multi-stage Feedback System`;
    
    return message;
  }

  // Helper functions for text conversion
  getRatingText(rating) {
    const ratingTexts = {
      '1': 'Very Dissatisfied',
      '2': 'Dissatisfied', 
      '3': 'Neutral',
      '4': 'Satisfied',
      '5': 'Very Satisfied'
    };
    return ratingTexts[rating] || 'Unknown';
  }

  getIssueText(issue) {
    const issueTexts = {
      'incomplete_product_info': 'Incomplete product info (e.g., battery specs, sizing)',
      'live_chat_failed': 'Live Chat failed',
      'find_local_dealer': 'Find a local dealer',
      'technical_bug': 'Technical bug (e.g., checkout errors, 404)',
      'navigation_issues': 'Computer/Mobile navigation issues',
      'others': 'Others'
    };
    return issueTexts[issue] || issue;
  }

  getMobileDifficultyText(difficulty) {
    const difficultyTexts = {
      'menu_structure_unclear': 'Menu structure unclear',
      'product_filters_broken': 'Product filters broken',
      'image_gallery_slow': 'Image gallery too slow',
      'other': 'Other'
    };
    return difficultyTexts[difficulty] || difficulty;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.FeedbackModal = new FeedbackModal();
  window.FeedbackModal.init();
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FeedbackModal;
}