# Controls Standardization Implementation Guide

## Overview

This guide outlines the implementation of a standardized controls system that ensures consistent UI controls across all pages. This system will provide reusable, accessible, and visually consistent interactive elements with standardized behavior.

## Key Features

- Unified control components (buttons, inputs, select boxes, etc.)
- Consistent styling with theme awareness
- Accessibility compliance
- Automatic state binding when applicable
- Standardized event handling

## Implementation Steps

### 1. Create Controls CSS Base

Create a new file `public/css/components/controls.css`:

```css
/* Base Control Styles */
:root {
  /* Control sizing */
  --control-height-sm: 24px;
  --control-height-md: 32px;
  --control-height-lg: 40px;
  
  /* Control colors - light theme */
  --control-bg: #f0f2f5;
  --control-bg-hover: #e4e7eb;
  --control-bg-active: #d8dce0;
  --control-border: #c0c6cf;
  --control-text: #2c3e50;
  --control-text-disabled: #8c97a6;
  
  /* Primary action colors */
  --primary-color: #2c7be5;
  --primary-color-hover: #1a68d1;
  --primary-color-active: #155cbe;
  --primary-color-text: #ffffff;
  
  /* Secondary action colors */
  --secondary-color: #6c757d;
  --secondary-color-hover: #5a6268;
  --secondary-color-active: #4e555b;
  --secondary-color-text: #ffffff;
  
  /* Success, warning, danger colors */
  --success-color: #42ba96;
  --warning-color: #f9d86e;
  --danger-color: #df4759;
  
  /* Focus state */
  --focus-ring-color: rgba(44, 123, 229, 0.25);
  --focus-ring-width: 3px;
}

/* Dark theme overrides */
body.dark-theme {
  --control-bg: #2c3e50;
  --control-bg-hover: #34495e;
  --control-bg-active: #3d5a76;
  --control-border: #465c71;
  --control-text: #ecf0f1;
  --control-text-disabled: #a0aec0;
  
  /* Adjust primary colors for dark theme */
  --primary-color: #3498db;
  --primary-color-hover: #2980b9;
  --primary-color-active: #2574a9;
  
  /* Adjust focus state for dark theme */
  --focus-ring-color: rgba(52, 152, 219, 0.3);
}

/* Common Control Styles */
.control {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--control-height-md);
  padding: 0 16px;
  border-radius: 4px;
  border: 1px solid var(--control-border);
  background-color: var(--control-bg);
  color: var(--control-text);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  outline: none;
  user-select: none;
}

/* Control states */
.control:hover {
  background-color: var(--control-bg-hover);
}

.control:active {
  background-color: var(--control-bg-active);
}

.control:focus {
  box-shadow: 0 0 0 var(--focus-ring-width) var(--focus-ring-color);
}

.control:disabled,
.control.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
  color: var(--control-text-disabled);
}

/* Control sizes */
.control-sm {
  height: var(--control-height-sm);
  padding: 0 12px;
  font-size: 12px;
}

.control-lg {
  height: var(--control-height-lg);
  padding: 0 20px;
  font-size: 16px;
}

/* Control variants */
.control-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--primary-color-text);
}

.control-primary:hover {
  background-color: var(--primary-color-hover);
  border-color: var(--primary-color-hover);
}

.control-primary:active {
  background-color: var(--primary-color-active);
  border-color: var(--primary-color-active);
}

.control-secondary {
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
  color: var(--secondary-color-text);
}

.control-secondary:hover {
  background-color: var(--secondary-color-hover);
  border-color: var(--secondary-color-hover);
}

.control-secondary:active {
  background-color: var(--secondary-color-active);
  border-color: var(--secondary-color-active);
}

.control-outline {
  background-color: transparent;
  color: var(--primary-color);
}

.control-outline:hover {
  background-color: rgba(44, 123, 229, 0.1);
}

.control-outline.control-secondary {
  color: var(--secondary-color);
}

.control-outline.control-secondary:hover {
  background-color: rgba(108, 117, 125, 0.1);
}

.control-text {
  background-color: transparent;
  border-color: transparent;
  padding: 0 8px;
}

.control-text:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

body.dark-theme .control-text:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Status colors */
.control-success {
  background-color: var(--success-color);
  border-color: var(--success-color);
  color: #ffffff;
}

.control-warning {
  background-color: var(--warning-color);
  border-color: var(--warning-color);
  color: #212529;
}

.control-danger {
  background-color: var(--danger-color);
  border-color: var(--danger-color);
  color: #ffffff;
}

/* Control with icon */
.control-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.control-icon i,
.control-icon svg {
  margin-right: 8px;
}

.control-icon-only {
  width: var(--control-height-md);
  padding: 0;
  justify-content: center;
}

.control-icon-only.control-sm {
  width: var(--control-height-sm);
}

.control-icon-only.control-lg {
  width: var(--control-height-lg);
}

.control-icon-only i,
.control-icon-only svg {
  margin-right: 0;
}

/* Button group */
.control-group {
  display: inline-flex;
  border-radius: 4px;
  overflow: hidden;
}

.control-group .control {
  border-radius: 0;
  margin-left: -1px;
}

.control-group .control:first-child {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  margin-left: 0;
}

.control-group .control:last-child {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

.control-group .control:focus {
  position: relative;
  z-index: 1;
}

/* Form controls - inputs, selects, etc. */
.input,
.select,
.textarea {
  display: block;
  width: 100%;
  height: var(--control-height-md);
  padding: 0 12px;
  font-size: 14px;
  line-height: var(--control-height-md);
  color: var(--control-text);
  background-color: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: 4px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.input:focus,
.select:focus,
.textarea:focus {
  border-color: var(--primary-color);
  outline: 0;
  box-shadow: 0 0 0 var(--focus-ring-width) var(--focus-ring-color);
}

.input::placeholder,
.textarea::placeholder {
  color: var(--control-text-disabled);
  opacity: 1;
}

.input:disabled,
.select:disabled,
.textarea:disabled {
  background-color: rgba(0, 0, 0, 0.05);
  cursor: not-allowed;
  opacity: 0.7;
}

.textarea {
  height: auto;
  min-height: calc(var(--control-height-md) * 3);
  resize: vertical;
  line-height: 1.5;
  padding: 8px 12px;
}

/* Checkbox and radio styles */
.checkbox-container,
.radio-container {
  display: block;
  position: relative;
  padding-left: 28px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
  color: var(--control-text);
}

.checkbox-container input,
.radio-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: var(--control-bg);
  border: 1px solid var(--control-border);
}

.radio-container .checkmark {
  border-radius: 50%;
}

.checkbox-container:hover input ~ .checkmark,
.radio-container:hover input ~ .checkmark {
  background-color: var(--control-bg-hover);
}

.checkbox-container input:checked ~ .checkmark,
.radio-container input:checked ~ .checkmark {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.checkbox-container .checkmark:after,
.radio-container .checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after,
.radio-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.radio-container .checkmark:after {
  top: 6px;
  left: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
}

/* Toggle switch */
.switch-container {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 24px;
  margin-bottom: 0;
}

.switch-container input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--control-bg);
  border: 1px solid var(--control-border);
  transition: .4s;
  border-radius: 24px;
}

.switch:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: var(--control-text);
  transition: .4s;
  border-radius: 50%;
}

input:checked + .switch {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

input:focus + .switch {
  box-shadow: 0 0 0 var(--focus-ring-width) var(--focus-ring-color);
}

input:checked + .switch:before {
  transform: translateX(16px);
  background-color: white;
}

/* Form layout helpers */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--control-text);
}

.form-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--control-text-disabled);
}

.form-error {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--danger-color);
}

.form-inline {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
}

.form-inline .form-group {
  display: flex;
  flex: 0 0 auto;
  flex-flow: row wrap;
  align-items: center;
  margin-bottom: 0;
  margin-right: 16px;
}

/* Loading indicator */
.loading-spinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spinner-rotate 0.6s linear infinite;
}

@keyframes spinner-rotate {
  to { transform: rotate(360deg); }
}

.control.loading {
  position: relative;
  color: transparent !important;
}

.control.loading .loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -0.5em;
  margin-left: -0.5em;
}

.control.control-primary.loading .loading-spinner,
.control.control-secondary.loading .loading-spinner,
.control.control-success.loading .loading-spinner,
.control.control-danger.loading .loading-spinner {
  border-color: rgba(255, 255, 255, 0.2);
  border-top-color: white;
}
```

### 2. Create Controls Component Factory

Create a new file `public/js/components/controls.js`:

```javascript
/**
 * Controls Factory
 * Creates standardized UI controls with consistent behavior
 */
const ControlsFactory = {
  /**
   * Create a button element
   * @param {Object} options - Button configuration
   * @returns {HTMLElement} Button element
   */
  createButton: function(options = {}) {
    const defaultOptions = {
      text: 'Button',
      type: 'button',
      variant: '',  // primary, secondary, outline, text
      size: '',     // sm, lg
      icon: '',     // icon HTML or class
      iconOnly: false,
      disabled: false,
      loading: false,
      onClick: null,
      classes: []
    };
    
    const settings = {...defaultOptions, ...options};
    
    // Create button element
    const button = document.createElement('button');
    button.type = settings.type;
    button.className = 'control';
    
    // Add variant
    if (settings.variant) {
      button.appendChild(spinner);
    }
    
    // Add additional classes
    if (settings.classes && settings.classes.length) {
      button.classList.add(...settings.classes);
    }
    
    // Add click handler
    if (typeof settings.onClick === 'function') {
      button.addEventListener('click', settings.onClick);
    }
    
    return button;
  },
  
  /**
   * Create an input element
   * @param {Object} options - Input configuration
   * @returns {HTMLElement} Input element
   */
  createInput: function(options = {}) {
    const defaultOptions = {
      type: 'text',
      placeholder: '',
      value: '',
      label: '',
      id: this._generateId('input'),
      name: '',
      required: false,
      disabled: false,
      readonly: false,
      hint: '',
      error: '',
      onChange: null,
      onInput: null,
      onFocus: null,
      onBlur: null,
      classes: [],
      bindToState: null
    };
    
    const settings = {...defaultOptions, ...options};
    
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'form-group';
    
    // Add label if provided
    if (settings.label) {
      const label = document.createElement('label');
      label.className = 'form-label';
      label.htmlFor = settings.id;
      label.textContent = settings.label;
      
      if (settings.required) {
        const requiredMark = document.createElement('span');
        requiredMark.className = 'required-mark';
        requiredMark.textContent = ' *';
        label.appendChild(requiredMark);
      }
      
      wrapper.appendChild(label);
    }
    
    // Create input element
    const input = document.createElement('input');
    input.type = settings.type;
    input.id = settings.id;
    input.className = 'input';
    
    if (settings.name) input.name = settings.name;
    if (settings.placeholder) input.placeholder = settings.placeholder;
    if (settings.value) input.value = settings.value;
    if (settings.required) input.required = true;
    if (settings.disabled) input.disabled = true;
    if (settings.readonly) input.readOnly = true;
    
    // Add additional classes
    if (settings.classes && settings.classes.length) {
      input.classList.add(...settings.classes);
    }
    
    // Add event handlers
    if (typeof settings.onChange === 'function') {
      input.addEventListener('change', settings.onChange);
    }
    
    if (typeof settings.onInput === 'function') {
      input.addEventListener('input', settings.onInput);
    }
    
    if (typeof settings.onFocus === 'function') {
      input.addEventListener('focus', settings.onFocus);
    }
    
    if (typeof settings.onBlur === 'function') {
      input.addEventListener('blur', settings.onBlur);
    }
    
    // Bind to state if specified
    if (settings.bindToState && window.StateManager) {
      window.StateManager.bindToElement(settings.bindToState, input);
    }
    
    wrapper.appendChild(input);
    
    // Add hint if provided
    if (settings.hint) {
      const hint = document.createElement('div');
      hint.className = 'form-hint';
      hint.textContent = settings.hint;
      wrapper.appendChild(hint);
    }
    
    // Add error if provided
    if (settings.error) {
      const error = document.createElement('div');
      error.className = 'form-error';
      error.textContent = settings.error;
      wrapper.appendChild(error);
    }
    
    return wrapper;
  },
  
  /**
   * Create a select dropdown
   * @param {Object} options - Select configuration
   * @returns {HTMLElement} Select element
   */
  createSelect: function(options = {}) {
    const defaultOptions = {
      options: [],
      value: '',
      label: '',
      id: this._generateId('select'),
      name: '',
      required: false,
      disabled: false,
      placeholder: 'Select an option',
      hint: '',
      error: '',
      onChange: null,
      onFocus: null,
      onBlur: null,
      classes: [],
      bindToState: null
    };
    
    const settings = {...defaultOptions, ...options};
    
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'form-group';
    
    // Add label if provided
    if (settings.label) {
      const label = document.createElement('label');
      label.className = 'form-label';
      label.htmlFor = settings.id;
      label.textContent = settings.label;
      
      if (settings.required) {
        const requiredMark = document.createElement('span');
        requiredMark.className = 'required-mark';
        requiredMark.textContent = ' *';
        label.appendChild(requiredMark);
      }
      
      wrapper.appendChild(label);
    }
    
    // Create select element
    const select = document.createElement('select');
    select.id = settings.id;
    select.className = 'select';
    
    if (settings.name) select.name = settings.name;
    if (settings.required) select.required = true;
    if (settings.disabled) select.disabled = true;
    
    // Add placeholder option
    if (settings.placeholder) {
      const placeholderOption = document.createElement('option');
      placeholderOption.value = '';
      placeholderOption.textContent = settings.placeholder;
      placeholderOption.disabled = true;
      
      if (!settings.value) {
        placeholderOption.selected = true;
      }
      
      select.appendChild(placeholderOption);
    }
    
    // Add options
    settings.options.forEach(option => {
      const optionEl = document.createElement('option');
      
      if (typeof option === 'object') {
        optionEl.value = option.value;
        optionEl.textContent = option.label;
        
        if (option.disabled) {
          optionEl.disabled = true;
        }
      } else {
        optionEl.value = option;
        optionEl.textContent = option;
      }
      
      if (optionEl.value === settings.value) {
        optionEl.selected = true;
      }
      
      select.appendChild(optionEl);
    });
    
    // Add additional classes
    if (settings.classes && settings.classes.length) {
      select.classList.add(...settings.classes);
    }
    
    // Add event handlers
    if (typeof settings.onChange === 'function') {
      select.addEventListener('change', settings.onChange);
    }
    
    if (typeof settings.onFocus === 'function') {
      select.addEventListener('focus', settings.onFocus);
    }
    
    if (typeof settings.onBlur === 'function') {
      select.addEventListener('blur', settings.onBlur);
    }
    
    // Bind to state if specified
    if (settings.bindToState && window.StateManager) {
      window.StateManager.bindToElement(settings.bindToState, select);
    }
    
    wrapper.appendChild(select);
    
    // Add hint if provided
    if (settings.hint) {
      const hint = document.createElement('div');
      hint.className = 'form-hint';
      hint.textContent = settings.hint;
      wrapper.appendChild(hint);
    }
    
    // Add error if provided
    if (settings.error) {
      const error = document.createElement('div');
      error.className = 'form-error';
      error.textContent = settings.error;
      wrapper.appendChild(error);
    }
    
    return wrapper;
  },
  
  /**
   * Create a checkbox
   * @param {Object} options - Checkbox configuration
   * @returns {HTMLElement} Checkbox element
   */
  createCheckbox: function(options = {}) {
    const defaultOptions = {
      label: 'Checkbox',
      id: this._generateId('checkbox'),
      name: '',
      checked: false,
      disabled: false,
      onChange: null,
      classes: [],
      bindToState: null
    };
    
    const settings = {...defaultOptions, ...options};
    
    // Create container
    const container = document.createElement('label');
    container.className = 'checkbox-container';
    container.htmlFor = settings.id;
    
    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = settings.id;
    
    if (settings.name) checkbox.name = settings.name;
    if (settings.checked) checkbox.checked = true;
    if (settings.disabled) checkbox.disabled = true;
    
    // Add additional classes
    if (settings.classes && settings.classes.length) {
      container.classList.add(...settings.classes);
    }
    
    // Add event handler
    if (typeof settings.onChange === 'function') {
      checkbox.addEventListener('change', settings.onChange);
    }
    
    // Bind to state if specified
    if (settings.bindToState && window.StateManager) {
      window.StateManager.bindToElement(settings.bindToState, checkbox, {
        attribute: 'checked',
        event: 'change'
      });
    }
    
    // Create checkmark and add label text
    const checkmark = document.createElement('span');
    checkmark.className = 'checkmark';
    
    container.appendChild(checkbox);
    container.appendChild(checkmark);
    container.appendChild(document.createTextNode(settings.label));
    
    return container;
  },
  
  /**
   * Create a toggle switch
   * @param {Object} options - Toggle configuration
   * @returns {HTMLElement} Toggle switch element
   */
  createToggle: function(options = {}) {
    const defaultOptions = {
      label: 'Toggle',
      id: this._generateId('toggle'),
      name: '',
      checked: false,
      disabled: false,
      onChange: null,
      classes: [],
      bindToState: null
    };
    
    const settings = {...defaultOptions, ...options};
    
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'form-group form-inline';
    
    // Create label text
    const labelText = document.createElement('span');
    labelText.textContent = settings.label;
    labelText.className = 'form-label';
    wrapper.appendChild(labelText);
    
    // Create switch container
    const container = document.createElement('label');
    container.className = 'switch-container';
    container.htmlFor = settings.id;
    
    // Create toggle
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.id = settings.id;
    
    if (settings.name) toggle.name = settings.name;
    if (settings.checked) toggle.checked = true;
    if (settings.disabled) toggle.disabled = true;
    
    // Add event handler
    if (typeof settings.onChange === 'function') {
      toggle.addEventListener('change', settings.onChange);
    }
    
    // Bind to state if specified
    if (settings.bindToState && window.StateManager) {
      window.StateManager.bindToElement(settings.bindToState, toggle, {
        attribute: 'checked',
        event: 'change'
      });
    }
    
    // Create slider and add to container
    const slider = document.createElement('span');
    slider.className = 'switch';
    
    container.appendChild(toggle);
    container.appendChild(slider);
    
    // Add additional classes
    if (settings.classes && settings.classes.length) {
      container.classList.add(...settings.classes);
    }
    
    wrapper.appendChild(container);
    
    return wrapper;
  },
  
  /**
   * Create a button group
   * @param {Array} buttons - Array of button configs or button elements
   * @returns {HTMLElement} Button group element
   */
  createButtonGroup: function(buttons = []) {
    const group = document.createElement('div');
    group.className = 'control-group';
    
    buttons.forEach(buttonConfig => {
      let buttonEl;
      
      if (buttonConfig instanceof HTMLElement) {
        buttonEl = buttonConfig;
      } else {
        buttonEl = this.createButton(buttonConfig);
      }
      
      group.appendChild(buttonEl);
    });
    
    return group;
  },
  
  /**
   * Create a form
   * @param {Object} options - Form configuration
   * @returns {HTMLElement} Form element
   */
  createForm: function(options = {}) {
    const defaultOptions = {
      id: this._generateId('form'),
      action: '',
      method: 'post',
      fields: [],
      submitButton: { text: 'Submit' },
      cancelButton: null,
      onSubmit: null,
      onReset: null,
      classes: []
    };
    
    const settings = {...defaultOptions, ...options};
    
    // Create form element
    const form = document.createElement('form');
    form.id = settings.id;
    form.className = 'form';
    
    if (settings.action) form.action = settings.action;
    if (settings.method) form.method = settings.method;
    
    // Add additional classes
    if (settings.classes && settings.classes.length) {
      form.classList.add(...settings.classes);
    }
    
    // Add fields
    settings.fields.forEach(field => {
      let fieldEl;
      
      if (field instanceof HTMLElement) {
        fieldEl = field;
      } else {
        switch (field.type) {
          case 'select':
            fieldEl = this.createSelect(field);
            break;
          case 'checkbox':
            fieldEl = this.createCheckbox(field);
            break;
          case 'toggle':
            fieldEl = this.createToggle(field);
            break;
          default:
            fieldEl = this.createInput(field);
        }
      }
      
      form.appendChild(fieldEl);
    });
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'form-buttons';
    
    // Add submit button
    if (settings.submitButton) {
      const submitConfig = {
        ...settings.submitButton,
        type: 'submit',
        variant: settings.submitButton.variant || 'primary'
      };
      
      const submitButton = this.createButton(submitConfig);
      buttonContainer.appendChild(submitButton);
    }
    
    // Add cancel button
    if (settings.cancelButton) {
      const cancelConfig = {
        ...settings.cancelButton,
        type: 'button',
        variant: settings.cancelButton.variant || 'secondary'
      };
      
      const cancelButton = this.createButton(cancelConfig);
      buttonContainer.appendChild(cancelButton);
    }
    
    form.appendChild(buttonContainer);
    
    // Add event handlers
    if (typeof settings.onSubmit === 'function') {
      form.addEventListener('submit', e => {
        e.preventDefault();
        settings.onSubmit(e, new FormData(form));
      });
    }
    
    if (typeof settings.onReset === 'function') {
      form.addEventListener('reset', settings.onReset);
    }
    
    return form;
  },
  
  /**
   * Generate unique ID for elements
   * @private
   * @param {string} prefix - ID prefix
   * @returns {string} Unique ID
   */
  _generateId: function(prefix = 'control') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }
};

// Make controls factory globally available
window.ControlsFactory = ControlsFactory;
```

### 3. Create Implementation Utilities

Create a new file `public/js/utils/controls-utils.js` for additional helper methods:

```javascript
/**
 * Controls Utilities
 * Helper functions for working with standardized controls
 */
const ControlsUtils = {
  /**
   * Initialize all automatic controls on a page
   */
  initializeControls: function() {
    this.initializeButtons();
    this.initializeToggles();
    this.initializeDropdowns();
    this.setupFormValidation();
  },
  
  /**
   * Initialize buttons with data attributes
   */
  initializeButtons: function() {
    // Find all buttons with data-action attribute
    document.querySelectorAll('button[data-action]').forEach(button => {
      const action = button.getAttribute('data-action');
      
      // Add click handler based on action
      if (action === 'toggle-panel') {
        const panelId = button.getAttribute('data-target');
        if (panelId && window.PanelManager) {
          button.addEventListener('click', () => {
            window.PanelManager.togglePanel(panelId);
          });
        }
      } else if (action === 'toggle-theme') {
        button.addEventListener('click', () => {
          if (window.StateManager) {
            const currentTheme = window.StateManager.get('ui.darkMode');
            window.StateManager.set('ui.darkMode', !currentTheme, true);
          } else {
            document.body.classList.toggle('dark-theme');
          }
        });
      } else if (action === 'toggle-navigation') {
        button.addEventListener('click', () => {
          if (window.StateManager) {
            const currentState = window.StateManager.get('ui.navExpanded');
            window.StateManager.set('ui.navExpanded', !currentState, true);
          } else {
            document.querySelector('nav.main-nav').classList.toggle('expanded');
          }
        });
      }
    });
  },
  
  /**
   * Initialize toggle switches with data attributes
   */
  initializeToggles: function() {
    // Find all toggle inputs with data-bind attribute
    document.querySelectorAll('input[type="checkbox"][data-bind]').forEach(toggle => {
      const bindKey = toggle.getAttribute('data-bind');
      
      if (bindKey && window.StateManager) {
        window.StateManager.bindToElement(bindKey, toggle, {
          attribute: 'checked',
          event: 'change'
        });
      }
    });
  },
  
  /**
   * Initialize dropdowns with data attributes
   */
  initializeDropdowns: function() {
    // Find all select elements with data-bind attribute
    document.querySelectorAll('select[data-bind]').forEach(select => {
      const bindKey = select.getAttribute('data-bind');
      
      if (bindKey && window.StateManager) {
        window.StateManager.bindToElement(bindKey, select);
      }
    });
  },
  
  /**
   * Set up basic form validation
   */
  setupFormValidation: function() {
    // Find all forms with data-validate attribute
    document.querySelectorAll('form[data-validate]').forEach(form => {
      form.setAttribute('novalidate', '');
      
      form.addEventListener('submit', e => {
        if (!form.checkValidity()) {
          e.preventDefault();
          e.stopPropagation();
          
          // Show validation messages
          this.showValidationMessages(form);
        }
        
        form.classList.add('was-validated');
      });
    });
  },
  
  /**
   * Show validation messages for a form
   * @param {HTMLFormElement} form - Form to validate
   */
  showValidationMessages: function(form) {
    // Check each form control
    form.querySelectorAll('input, select, textarea').forEach(input => {
      if (!input.validity.valid) {
        // Find or create error message element
        let errorEl = input.parentNode.querySelector('.form-error');
        
        if (!errorEl) {
          errorEl = document.createElement('div');
          errorEl.className = 'form-error';
          input.parentNode.appendChild(errorEl);
        }
        
        // Set appropriate error message
        if (input.validity.valueMissing) {
          errorEl.textContent = input.getAttribute('data-error-required') || 'This field is required';
        } else if (input.validity.typeMismatch) {
          errorEl.textContent = input.getAttribute('data-error-type') || 'Please enter a valid value';
        } else if (input.validity.patternMismatch) {
          errorEl.textContent = input.getAttribute('data-error-pattern') || 'Value does not match the required pattern';
        } else if (input.validity.tooShort || input.validity.tooLong) {
          errorEl.textContent = input.getAttribute('data-error-length') || 'Length is invalid';
        } else {
          errorEl.textContent = input.getAttribute('data-error') || 'This value is invalid';
        }
        
        // Add error class to input
        input.classList.add('input-error');
      }
    });
  },
  
  /**
   * Set loading state on a button
   * @param {HTMLElement} button - Button to set loading state
   * @param {boolean} isLoading - Whether button is in loading state
   */
  setButtonLoading: function(button, isLoading) {
    if (isLoading) {
      // Store original text
      button.setAttribute('data-original-text', button.textContent);
      
      // Add loading class
      button.classList.add('loading');
      
      // Create spinner if not exists
      if (!button.querySelector('.loading-spinner')) {
        const spinner = document.createElement('span');
        spinner.className = 'loading-spinner';
        button.appendChild(spinner);
      }
      
      // Disable button
      button.disabled = true;
    } else {
      // Remove loading class
      button.classList.remove('loading');
      
      // Restore original text
      const originalText = button.getAttribute('data-original-text');
      if (originalText) {
        button.textContent = originalText;
        button.removeAttribute('data-original-text');
      }
      
      // Enable button
      button.disabled = false;
    }
  }
};

// Initialize controls when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  ControlsUtils.initializeControls();
});

// Make utils globally available
window.ControlsUtils = ControlsUtils;
```

### 4. Create Declarative HTML Controls

Update your HTML templates to use the standardized control patterns:

```html
<!-- Button examples -->
<button class="control">Default Button</button>
<button class="control control-primary">Primary Button</button>
<button class="control control-secondary">Secondary Button</button>
<button class="control control-outline">Outline Button</button>
<button class="control control-sm">Small Button</button>
<button class="control control-lg">Large Button</button>
<button class="control control-icon">
  <i class="icon-settings"></i>
  Settings
</button>
<button class="control control-icon-only control-primary" title="Settings">
  <i class="icon-settings"></i>
</button>

<!-- Button group -->
<div class="control-group">
  <button class="control">Left</button>
  <button class="control">Middle</button>
  <button class="control">Right</button>
</div>

<!-- Form controls -->
<div class="form-group">
  <label class="form-label" for="example-input">Input Label</label>
  <input class="input" id="example-input" type="text" placeholder="Enter value">
  <div class="form-hint">Optional helper text</div>
</div>

<div class="form-group">
  <label class="form-label" for="example-select">Select Label</label>
  <select class="select" id="example-select">
    <option value="" disabled selected>Choose an option</option>
    <option value="option1">Option 1</option>
    <option value="option2">Option 2</option>
  </select>
</div>

<!-- Checkbox and radio -->
<label class="checkbox-container">
  Checkbox Label
  <input type="checkbox">
  <span class="checkmark"></span>
</label>

<label class="radio-container">
  Radio Label
  <input type="radio" name="radio-group">
  <span class="checkmark"></span>
</label>

<!-- Toggle switch -->
<label class="switch-container">
  <input type="checkbox">
  <span class="switch"></span>
</label>
<span>Toggle Label</span>

<!-- Automatic state binding -->
<input type="checkbox" data-bind="ui.darkMode">
<select data-bind="ui.refreshInterval">
  <option value="5000">5 seconds</option>
  <option value="10000">10 seconds</option>
  <option value="30000">30 seconds</option>
</select>
```

### 5. Create JavaScript Controls Dynamically

Example JavaScript code for programmatic control creation:

```javascript
// Create a primary button
const primaryButton = ControlsFactory.createButton({
  text: 'Save Settings',
  variant: 'primary',
  icon: '<svg viewBox="0 0 24 24">...</svg>',
  onClick: function() {
    console.log('Save clicked');
    saveSettings();
  }
});

// Add to container
document.getElementById('button-container').appendChild(primaryButton);

// Create a form
const settingsForm = ControlsFactory.createForm({
  id: 'settings-form',
  fields: [
    {
      type: 'text',
      label: 'API Key',
      id: 'api-key',
      required: true,
      placeholder: 'Enter your API key',
      bindToState: 'settings.apiKey'
    },
    {
      type: 'select',
      label: 'Refresh Interval',
      id: 'refresh-interval',
      options: [
        { value: '5000', label: '5 seconds' },
        { value: '10000', label: '10 seconds' },
        { value: '30000', label: '30 seconds' }
      ],
      bindToState: 'settings.refreshInterval'
    },
    {
      type: 'toggle',
      label: 'Enable Notifications',
      id: 'enable-notifications',
      bindToState: 'settings.notifications'
    }
  ],
  submitButton: {
    text: 'Save Settings',
    variant: 'primary'
  },
  cancelButton: {
    text: 'Cancel',
    variant: 'outline',
    onClick: function() {
      window.location.href = '/dashboard';
    }
  },
  onSubmit: function(event, formData) {
    console.log('Form submitted', formData);
    // Process form submission
    saveSettings(formData);
  }
});

// Add to container
document.getElementById('form-container').appendChild(settingsForm);
```

## Testing

### 1. Unit Tests for Controls Factory

Create a test file at `test/unit/components/controls.test.js`:

```javascript
describe('Controls Factory', () => {
  describe('Button Creation', () => {
    it('should create a basic button', () => {
      const button = ControlsFactory.createButton({ text: 'Test Button' });
      
      expect(button.tagName).toBe('BUTTON');
      expect(button.textContent).toBe('Test Button');
      expect(button.className).toContain('control');
    });
    
    it('should create a primary button', () => {
      const button = ControlsFactory.createButton({ 
        text: 'Primary', 
        variant: 'primary' 
      });
      
      expect(button.className).toContain('control-primary');
    });
    
    it('should handle icon-only buttons', () => {
      const button = ControlsFactory.createButton({
        icon: '<svg></svg>',
        iconOnly: true
      });
      
      expect(button.className).toContain('control-icon-only');
      expect(button.querySelector('svg')).not.toBeNull();
    });
    
    it('should attach click handler', () => {
      const mockHandler = jest.fn();
      const button = ControlsFactory.createButton({
        text: 'Click Me',
        onClick: mockHandler
      });
      
      button.click();
      
      expect(mockHandler).toHaveBeenCalled();
    });
  });
  
  describe('Form Control Creation', () => {
    it('should create an input with label', () => {
      const inputGroup = ControlsFactory.createInput({
        label: 'Test Input',
        placeholder: 'Enter value'
      });
      
      expect(inputGroup.className).toContain('form-group');
      
      const label = inputGroup.querySelector('label');
      expect(label.textContent).toBe('Test Input');
      
      const input = inputGroup.querySelector('input');
      expect(input.placeholder).toBe('Enter value');
    });
    
    it('should create a select dropdown', () => {
      const selectGroup = ControlsFactory.createSelect({
        label: 'Test Select',
        options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ]
      });
      
      const select = selectGroup.querySelector('select');
      expect(select).not.toBeNull();
      
      const options = select.querySelectorAll('option');
      expect(options.length).toBe(3); // Including placeholder
      
      expect(options[1].value).toBe('option1');
      expect(options[1].textContent).toBe('Option 1');
    });
    
    it('should create a checkbox', () => {
      const checkbox = ControlsFactory.createCheckbox({
        label: 'Test Checkbox',
        checked: true
      });
      
      expect(checkbox.className).toContain('checkbox-container');
      
      const input = checkbox.querySelector('input[type="checkbox"]');
      expect(input.checked).toBe(true);
      
      expect(checkbox.textContent).toContain('Test Checkbox');
    });
    
    it('should create a toggle switch', () => {
      const toggle = ControlsFactory.createToggle({
        label: 'Test Toggle'
      });
      
      expect(toggle.querySelector('.switch-container')).not.toBeNull();
      expect(toggle.textContent).toContain('Test Toggle');
      
      const input = toggle.querySelector('input[type="checkbox"]');
      expect(input).not.toBeNull();
    });
  });
});
```

### 2. Integration Tests

Create a test file at `test/integration/controls-integration.test.js`:

```javascript
describe('Controls Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="container">
        <div id="button-container"></div>
        <div id="form-container"></div>
        
        <button id="test-button" class="control control-primary" data-action="toggle-panel" data-target="test-panel">
          Toggle Panel
        </button>
      </div>
    `;
    
    // Mock PanelManager
    window.PanelManager = {
      togglePanel: jest.fn()
    };
    
    // Mock StateManager
    window.StateManager = {
      get: jest.fn(),
      set: jest.fn(),
      bindToElement: jest.fn()
    };
    
    // Initialize controls utils
    ControlsUtils.initializeControls();
  });
  
  it('should handle declarative panel toggle', () => {
    const button = document.getElementById('test-button');
    button.click();
    
    expect(PanelManager.togglePanel).toHaveBeenCalledWith('test-panel');
  });
  
  it('should create and attach a button programmatically', () => {
    const mockHandler = jest.fn();
    const button = ControlsFactory.createButton({
      text: 'Dynamic Button',
      variant: 'primary',
      onClick: mockHandler
    });
    
    document.getElementById('button-container').appendChild(button);
    
    // Button should be in the DOM
    const addedButton = document.querySelector('#button-container button');
    expect(addedButton).not.toBeNull();
    expect(addedButton.textContent).toBe('Dynamic Button');
    
    // Click handler should work
    addedButton.click();
    expect(mockHandler).toHaveBeenCalled();
  });
  
  it('should create a form programmatically', () => {
    const mockSubmit = jest.fn();
    const form = ControlsFactory.createForm({
      id: 'test-form',
      fields: [
        {
          type: 'text',
          label: 'Username',
          id: 'username',
          required: true
        },
        {
          type: 'checkbox',
          label: 'Remember me',
          id: 'remember'
        }
      ],
      submitButton: {
        text: 'Login'
      },
      onSubmit: mockSubmit
    });
    
    document.getElementById('form-container').appendChild(form);
    
    // Form should be in the DOM
    const addedForm = document.querySelector('#test-form');
    expect(addedForm).not.toBeNull();
    
    // Form should have the fields
    expect(document.getElementById('username')).not.toBeNull();
    expect(document.querySelector('.checkbox-container')).not.toBeNull();
    
    // Submit button should exist
    const submitButton = addedForm.querySelector('button[type="submit"]');
    expect(submitButton.textContent).toBe('Login');
    
    // Submit should trigger handler
    addedForm.dispatchEvent(new Event('submit'));
    expect(mockSubmit).toHaveBeenCalled();
  });
});
```

## Usage Examples

### 1. Panel Controls Integration

```javascript
// Initialize panel controls using standardized controls
document.addEventListener('DOMContentLoaded', function() {
  // Create panel toggle buttons
  const panelControls = document.getElementById('panel-controls');
  
  // Define panels
  const panels = [
    { id: 'gpu-panel', label: 'GPU Stats' },
    { id: 'cpu-panel', label: 'CPU Stats' },
    { id: 'memory-panel', label: 'Memory Stats' }
  ];
  
  // Create toggle buttons for each panel
  panels.forEach(panel => {
    const button = ControlsFactory.createButton({
      text: panel.label,
      variant: 'outline',
      onClick: function() {
        PanelManager.togglePanel(panel.id);
      }
    });
    
    panelControls.appendChild(button);
  });
  
  // Create show/hide all buttons
  const showAllBtn = ControlsFactory.createButton({
    text: 'Show All',
    variant: 'primary',
    onClick: function() {
      panels.forEach(panel => PanelManager.expandPanel(panel.id));
    }
  });
  
  const hideAllBtn = ControlsFactory.createButton({
    text: 'Hide All',
    variant: 'secondary',
    onClick: function() {
      panels.forEach(panel => PanelManager.collapsePanel(panel.id));
    }
  });
  
  panelControls.appendChild(showAllBtn);
  panelControls.appendChild(hideAllBtn);
});
```

### 2. Settings Form with State Integration

```javascript
// Create settings form with state binding
document.addEventListener('DOMContentLoaded', function() {
  const settingsContainer = document.getElementById('settings-container');
  
  const settingsForm = ControlsFactory.createForm({
    id: 'app-settings',
    fields: [
      {
        type: 'select',
        label: 'Theme',
        id: 'theme-select',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'auto', label: 'Auto (System)' }
        ],
        bindToState: 'preferences.theme'
      },
      {
        type: 'select',
        label: 'Default Page',
        id: 'default-page',
        options: [
          { value: 'dashboard', label: 'Dashboard' },
          { value: 'gpu', label: 'GPU Stats' },
          { value: 'cpu', label: 'CPU Stats' }
        ],
        bindToState: 'preferences.defaultPage'
      },
      {
        type: 'toggle',
        label: 'Auto Refresh',
        id: 'auto-refresh',
        bindToState: 'preferences.autoRefresh'
      },
      {
        type: 'select',
        label: 'Refresh Interval',
        id: 'refresh-interval',
        options: [
          { value: '5000', label: '5 seconds' },
          { value: '10000', label: '10 seconds' },
          { value: '30000', label: '30 seconds' },
          { value: '60000', label: '1 minute' }
        ],
        bindToState: 'preferences.refreshInterval'
      }
    ],
    submitButton: {
      text: 'Save Settings',
      variant: 'primary'
    },
    onSubmit: function(e, formData) {
      // Show loading state on button
      const submitBtn = e.submitter;
      ControlsUtils.setButtonLoading(submitBtn, true);
      
      // Save all settings to state with persistence
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('preferences.')) {
          StateManager.set(key, value, true);
        }
      }
      
      // Simulate API call
      setTimeout(() => {
        ControlsUtils.setButtonLoading(submitBtn, false);
        
        // Show success message
        const message = document.createElement('div');
        message.className = 'alert alert-success';
        message.textContent = 'Settings saved successfully';
        settingsContainer.prepend(message);
        
        // Remove message after 3 seconds
        setTimeout(() => message.remove(), 3000);
      }, 1000);
    }
  });
  
  settingsContainer.appendChild(settingsForm);
});
```

### 3. Automatic Controls Initialization

```html
<!-- index.html -->
<div class="app-container">
  <!-- Panel toggle buttons -->
  <div class="control-bar">
    <button class="control" data-action="toggle-panel" data-target="cpu-panel">
      Toggle CPU
    </button>
    <button class="control" data-action="toggle-panel" data-target="gpu-panel">
      Toggle GPU
    </button>
    <button class="control control-icon-only" data-action="toggle-theme" title="Toggle Theme">
      <i class="icon-theme"></i>
    </button>
  </div>
  
  <!-- State-bound controls -->
  <div class="settings-bar">
    <label class="switch-container">
      <input type="checkbox" data-bind="ui.showAllMetrics">
      <span class="switch"></span>
    </label>
    <span>Show All Metrics</span>
    
    <select class="select" data-bind="ui.viewMode">
      <option value="simple">Simple View</option>
      <option value="detailed">Detailed View</option>
      <option value="advanced">Advanced View</option>
    </select>
  </div>
</div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Controls are automatically initialized by ControlsUtils
  });
</script>
```

## Next Steps

After implementing the Controls Standardization, proceed with the Content Template System implementation to create a comprehensive, consistent UI framework for your application.

Key benefits of the standardized controls:

1. Consistent visual appearance across all pages
2. Simplified creation of new UI elements
3. Automatic integration with the State Management Service
4. Improved accessibility compliance
5. Easier maintenance with centralized styling and behavior
6. Reduced code duplication
classList.add(`control-${settings.variant}`);
    }
    
    // Add size
    if (settings.size) {
      button.classList.add(`control-${settings.size}`);
    }
    
    // Add icon
    if (settings.icon) {
      button.classList.add('control-icon');
      
      if (settings.iconOnly) {
        button.classList.add('control-icon-only');
      }
      
      // Insert icon
      if (settings.icon.startsWith('<')) {
        // HTML icon
        const iconWrapper = document.createElement('span');
        iconWrapper.innerHTML = settings.icon;
        button.appendChild(iconWrapper.firstChild);
      } else {
        // Class-based icon
        const iconEl = document.createElement('i');
        iconEl.className = settings.icon;
        button.appendChild(iconEl);
      }
    }
    
    // Add text if not icon-only
    if (!settings.iconOnly) {
      const textNode = document.createTextNode(settings.text);
      button.appendChild(textNode);
    }
    
    // Set disabled state
    if (settings.disabled) {
      button.disabled = true;
    }
    
    // Set loading state
    if (settings.loading) {
      button.classList.add('loading');
      
      const spinner = document.createElement('span');
      spinner.className = 'loading-spinner';
      button.