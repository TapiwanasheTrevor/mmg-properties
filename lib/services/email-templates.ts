import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auditHelpers } from '@/lib/security/audit-logger';

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: 'notification' | 'reminder' | 'welcome' | 'maintenance' | 'lease' | 'payment' | 'inspection' | 'general';
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: {
    name: string;
    label: string;
    description: string;
    required: boolean;
    defaultValue?: string;
  }[];
  isActive: boolean;
  isSystem: boolean; // System templates cannot be deleted
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface EmailNotification {
  id: string;
  templateId: string;
  recipientEmail: string;
  recipientName: string;
  recipientId?: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: Record<string, any>;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  scheduledAt?: Timestamp;
  sentAt?: Timestamp;
  deliveredAt?: Timestamp;
  errorMessage?: string;
  metadata: {
    category: string;
    relatedResource?: {
      type: string;
      id: string;
      name: string;
    };
    priority: 'low' | 'normal' | 'high' | 'urgent';
  };
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const emailTemplatesCollection = collection(db, 'email_templates');
const emailNotificationsCollection = collection(db, 'email_notifications');

// Default system email templates
const DEFAULT_EMAIL_TEMPLATES = [
  {
    name: 'Welcome New Tenant',
    description: 'Welcome email sent to new tenants when they join',
    category: 'welcome' as const,
    subject: 'Welcome to {{propertyName}} - Your Tenancy Begins!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">Welcome to MMG Property Consultancy</h1>
          <p style="font-size: 16px; color: #666;">Your new home awaits!</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">Dear {{tenantName}},</h2>
          <p>Welcome to your new home at <strong>{{propertyName}}</strong>! We're excited to have you as part of our community.</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937;">Your Lease Details:</h3>
          <ul style="line-height: 1.8;">
            <li><strong>Property:</strong> {{propertyAddress}}</li>
            <li><strong>Unit:</strong> {{unitLabel}}</li>
            <li><strong>Lease Start:</strong> {{leaseStartDate}}</li>
            <li><strong>Lease End:</strong> {{leaseEndDate}}</li>
            <li><strong>Monthly Rent:</strong> {{rentAmount}}</li>
            <li><strong>Payment Due:</strong> {{paymentDueDate}} of each month</li>
          </ul>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937;">Important Information:</h3>
          <ul style="line-height: 1.8;">
            <li><strong>Property Manager:</strong> {{agentName}} ({{agentContact}})</li>
            <li><strong>Emergency Contact:</strong> {{emergencyContact}}</li>
            <li><strong>Maintenance Requests:</strong> Submit through the tenant portal</li>
            <li><strong>Rent Payments:</strong> {{paymentInstructions}}</li>
          </ul>
        </div>
        
        <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #1e40af;">
            <strong>📱 Download our tenant app for easy access to:</strong><br>
            • Pay rent online<br>
            • Submit maintenance requests<br>
            • Access important documents<br>
            • Communicate with your property manager
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p style="font-weight: bold;">Welcome home!</p>
        </div>
        
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <p>MMG Property Consultancy<br>
          Email: info@mmgproperty.com<br>
          This is an automated message, please do not reply directly to this email.</p>
        </div>
      </div>
    `,
    textContent: `
Welcome to MMG Property Consultancy

Dear {{tenantName}},

Welcome to your new home at {{propertyName}}! We're excited to have you as part of our community.

Your Lease Details:
- Property: {{propertyAddress}}
- Unit: {{unitLabel}}
- Lease Start: {{leaseStartDate}}
- Lease End: {{leaseEndDate}}
- Monthly Rent: {{rentAmount}}
- Payment Due: {{paymentDueDate}} of each month

Important Information:
- Property Manager: {{agentName}} ({{agentContact}})
- Emergency Contact: {{emergencyContact}}
- Maintenance Requests: Submit through the tenant portal
- Rent Payments: {{paymentInstructions}}

Download our tenant app for easy access to pay rent, submit maintenance requests, access documents, and communicate with your property manager.

If you have any questions, please don't hesitate to contact us.

Welcome home!

MMG Property Consultancy
Email: info@mmgproperty.com
    `,
    variables: [
      { name: 'tenantName', label: 'Tenant Name', description: 'Full name of the tenant', required: true },
      { name: 'propertyName', label: 'Property Name', description: 'Name of the property', required: true },
      { name: 'propertyAddress', label: 'Property Address', description: 'Full address of the property', required: true },
      { name: 'unitLabel', label: 'Unit Label', description: 'Unit number or identifier', required: true },
      { name: 'leaseStartDate', label: 'Lease Start Date', description: 'When the lease begins', required: true },
      { name: 'leaseEndDate', label: 'Lease End Date', description: 'When the lease ends', required: true },
      { name: 'rentAmount', label: 'Rent Amount', description: 'Monthly rent amount', required: true },
      { name: 'paymentDueDate', label: 'Payment Due Date', description: 'Day of month rent is due', required: true },
      { name: 'agentName', label: 'Agent Name', description: 'Property manager name', required: true },
      { name: 'agentContact', label: 'Agent Contact', description: 'Property manager contact info', required: true },
      { name: 'emergencyContact', label: 'Emergency Contact', description: 'Emergency contact information', required: true },
      { name: 'paymentInstructions', label: 'Payment Instructions', description: 'How to pay rent', required: true },
    ],
  },
  {
    name: 'Rent Payment Reminder',
    description: 'Reminder sent to tenants about upcoming rent payments',
    category: 'reminder' as const,
    subject: 'Rent Payment Reminder - Due {{dueDate}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb;">Rent Payment Reminder</h1>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #856404; margin-top: 0;">Dear {{tenantName}},</h2>
          <p>This is a friendly reminder that your rent payment is due on <strong>{{dueDate}}</strong>.</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937;">Payment Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Property:</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">{{propertyName}}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Unit:</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">{{unitLabel}}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Amount Due:</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold; color: #dc3545;">{{amountDue}}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Due Date:</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">{{dueDate}}</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="color: #0c5460; margin-top: 0;">Payment Options:</h4>
          <p style="margin: 0;">{{paymentInstructions}}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Late Payment:</strong> Please note that payments received after {{dueDate}} may be subject to late fees as outlined in your lease agreement.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p>If you have any questions about your payment, please contact your property manager:</p>
          <p style="font-weight: bold;">{{agentName}}<br>{{agentContact}}</p>
        </div>
        
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <p>MMG Property Consultancy<br>
          This is an automated reminder. Please do not reply directly to this email.</p>
        </div>
      </div>
    `,
    textContent: `
Rent Payment Reminder

Dear {{tenantName}},

This is a friendly reminder that your rent payment is due on {{dueDate}}.

Payment Details:
- Property: {{propertyName}}
- Unit: {{unitLabel}}
- Amount Due: {{amountDue}}
- Due Date: {{dueDate}}

Payment Options:
{{paymentInstructions}}

Late Payment: Please note that payments received after {{dueDate}} may be subject to late fees as outlined in your lease agreement.

If you have any questions about your payment, please contact your property manager:
{{agentName}}
{{agentContact}}

MMG Property Consultancy
    `,
    variables: [
      { name: 'tenantName', label: 'Tenant Name', description: 'Full name of the tenant', required: true },
      { name: 'propertyName', label: 'Property Name', description: 'Name of the property', required: true },
      { name: 'unitLabel', label: 'Unit Label', description: 'Unit number or identifier', required: true },
      { name: 'amountDue', label: 'Amount Due', description: 'Total amount due', required: true },
      { name: 'dueDate', label: 'Due Date', description: 'When payment is due', required: true },
      { name: 'paymentInstructions', label: 'Payment Instructions', description: 'How to make payment', required: true },
      { name: 'agentName', label: 'Agent Name', description: 'Property manager name', required: true },
      { name: 'agentContact', label: 'Agent Contact', description: 'Property manager contact', required: true },
    ],
  },
  {
    name: 'Maintenance Request Confirmation',
    description: 'Confirmation sent when a maintenance request is submitted',
    category: 'maintenance' as const,
    subject: 'Maintenance Request Received - Ticket #{{ticketNumber}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb;">Maintenance Request Confirmed</h1>
        </div>
        
        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #155724; margin-top: 0;">Request Received</h2>
          <p>We have received your maintenance request and assigned it ticket number <strong>#{{ticketNumber}}</strong>.</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937;">Request Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Ticket Number:</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">#{{ticketNumber}}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Property:</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">{{propertyName}}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Unit:</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">{{unitLabel}}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Category:</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">{{category}}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Priority:</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">{{priority}}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Submitted:</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">{{submittedDate}}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h4 style="color: #1f2937;">Description:</h4>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
            {{description}}
          </div>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="color: #856404; margin-top: 0;">What happens next?</h4>
          <ul style="margin: 0; color: #856404;">
            <li>Our maintenance team will review your request</li>
            <li>You'll receive updates via email and SMS</li>
            <li>A technician will be scheduled for {{expectedTimeframe}}</li>
            <li>Please ensure access to the unit during scheduled times</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p>For urgent issues, please contact:</p>
          <p style="font-weight: bold;">{{emergencyContact}}</p>
          <p>Track your request status in the tenant portal or contact your property manager:</p>
          <p style="font-weight: bold;">{{agentName}}<br>{{agentContact}}</p>
        </div>
        
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <p>MMG Property Consultancy<br>
          This is an automated confirmation. Please do not reply directly to this email.</p>
        </div>
      </div>
    `,
    textContent: `
Maintenance Request Confirmed

We have received your maintenance request and assigned it ticket number #{{ticketNumber}}.

Request Details:
- Ticket Number: #{{ticketNumber}}
- Property: {{propertyName}}
- Unit: {{unitLabel}}
- Category: {{category}}
- Priority: {{priority}}
- Submitted: {{submittedDate}}

Description:
{{description}}

What happens next?
- Our maintenance team will review your request
- You'll receive updates via email and SMS
- A technician will be scheduled for {{expectedTimeframe}}
- Please ensure access to the unit during scheduled times

For urgent issues, please contact: {{emergencyContact}}

Track your request status in the tenant portal or contact your property manager:
{{agentName}}
{{agentContact}}

MMG Property Consultancy
    `,
    variables: [
      { name: 'ticketNumber', label: 'Ticket Number', description: 'Maintenance request ticket number', required: true },
      { name: 'propertyName', label: 'Property Name', description: 'Name of the property', required: true },
      { name: 'unitLabel', label: 'Unit Label', description: 'Unit number or identifier', required: true },
      { name: 'category', label: 'Category', description: 'Type of maintenance request', required: true },
      { name: 'priority', label: 'Priority', description: 'Priority level of the request', required: true },
      { name: 'submittedDate', label: 'Submitted Date', description: 'When the request was submitted', required: true },
      { name: 'description', label: 'Description', description: 'Description of the issue', required: true },
      { name: 'expectedTimeframe', label: 'Expected Timeframe', description: 'When maintenance is expected', required: true },
      { name: 'emergencyContact', label: 'Emergency Contact', description: 'Emergency contact information', required: true },
      { name: 'agentName', label: 'Agent Name', description: 'Property manager name', required: true },
      { name: 'agentContact', label: 'Agent Contact', description: 'Property manager contact', required: true },
    ],
  },
  {
    name: 'Lease Expiration Notice',
    description: 'Notice sent to tenants about upcoming lease expiration',
    category: 'lease' as const,
    subject: 'Important: Your Lease Expires on {{expirationDate}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc3545;">Lease Expiration Notice</h1>
        </div>
        
        <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #721c24; margin-top: 0;">Important Notice</h2>
          <p>Your lease for <strong>{{propertyName}}, {{unitLabel}}</strong> is set to expire on <strong>{{expirationDate}}</strong>.</p>
          <p>This is {{daysUntilExpiration}} days from today.</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937;">Lease Information:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Property:</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">{{propertyName}}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Unit:</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">{{unitLabel}}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Current Rent:</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">{{currentRent}}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Lease Start:</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">{{leaseStartDate}}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Lease End:</strong></td>
              <td style="padding: 10px; border: 1px solid #dee2e6; color: #dc3545; font-weight: bold;">{{expirationDate}}</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #0c5460; margin-top: 0;">Your Options:</h3>
          
          <div style="margin-bottom: 15px;">
            <h4 style="color: #0c5460; margin-bottom: 5px;">🔄 Renew Your Lease</h4>
            <p style="margin: 0;">We'd love to have you stay! Contact us to discuss renewal terms.</p>
            {{#if renewalTerms}}
            <p style="margin: 5px 0 0 0; font-weight: bold;">Proposed renewal: {{renewalTerms}}</p>
            {{/if}}
          </div>
          
          <div style="margin-bottom: 15px;">
            <h4 style="color: #0c5460; margin-bottom: 5px;">🏃‍♂️ Moving Out</h4>
            <p style="margin: 0;">If you plan to move out, please provide {{noticeRequired}} days written notice.</p>
          </div>
          
          <div>
            <h4 style="color: #0c5460; margin-bottom: 5px;">📅 Important Deadlines</h4>
            <ul style="margin: 0;">
              <li>Notice required by: {{noticeDeadline}}</li>
              <li>Move-out inspection: {{moveOutInspectionDate}}</li>
              <li>Final move-out date: {{expirationDate}}</li>
            </ul>
          </div>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #856404;">
            <strong>⚠️ Action Required:</strong> Please contact us within the next {{daysToRespond}} days to let us know your intentions.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p>To discuss renewal or provide notice, please contact your property manager:</p>
          <p style="font-weight: bold;">{{agentName}}<br>{{agentContact}}</p>
        </div>
        
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <p>MMG Property Consultancy<br>
          This is an important lease notice. Please respond promptly.</p>
        </div>
      </div>
    `,
    textContent: `
Lease Expiration Notice

Important Notice: Your lease for {{propertyName}}, {{unitLabel}} is set to expire on {{expirationDate}}. This is {{daysUntilExpiration}} days from today.

Lease Information:
- Property: {{propertyName}}
- Unit: {{unitLabel}}
- Current Rent: {{currentRent}}
- Lease Start: {{leaseStartDate}}
- Lease End: {{expirationDate}}

Your Options:

1. Renew Your Lease
   We'd love to have you stay! Contact us to discuss renewal terms.
   {{#if renewalTerms}}Proposed renewal: {{renewalTerms}}{{/if}}

2. Moving Out
   If you plan to move out, please provide {{noticeRequired}} days written notice.

Important Deadlines:
- Notice required by: {{noticeDeadline}}
- Move-out inspection: {{moveOutInspectionDate}}
- Final move-out date: {{expirationDate}}

Action Required: Please contact us within the next {{daysToRespond}} days to let us know your intentions.

To discuss renewal or provide notice, please contact your property manager:
{{agentName}}
{{agentContact}}

MMG Property Consultancy
    `,
    variables: [
      { name: 'propertyName', label: 'Property Name', description: 'Name of the property', required: true },
      { name: 'unitLabel', label: 'Unit Label', description: 'Unit number or identifier', required: true },
      { name: 'expirationDate', label: 'Expiration Date', description: 'When the lease expires', required: true },
      { name: 'daysUntilExpiration', label: 'Days Until Expiration', description: 'Number of days until lease expires', required: true },
      { name: 'currentRent', label: 'Current Rent', description: 'Current monthly rent amount', required: true },
      { name: 'leaseStartDate', label: 'Lease Start Date', description: 'When the current lease started', required: true },
      { name: 'renewalTerms', label: 'Renewal Terms', description: 'Proposed renewal terms', required: false },
      { name: 'noticeRequired', label: 'Notice Required', description: 'Days of notice required', required: true },
      { name: 'noticeDeadline', label: 'Notice Deadline', description: 'Deadline to provide notice', required: true },
      { name: 'moveOutInspectionDate', label: 'Move-out Inspection Date', description: 'When move-out inspection will occur', required: true },
      { name: 'daysToRespond', label: 'Days to Respond', description: 'Days tenant has to respond', required: true },
      { name: 'agentName', label: 'Agent Name', description: 'Property manager name', required: true },
      { name: 'agentContact', label: 'Agent Contact', description: 'Property manager contact', required: true },
    ],
  },
];

// Get all email templates
export const getEmailTemplates = async (options: {
  category?: string;
  active?: boolean;
} = {}): Promise<EmailTemplate[]> => {
  try {
    let q = query(emailTemplatesCollection);
    
    if (options.category) {
      q = query(q, where('category', '==', options.category));
    }
    
    if (options.active !== undefined) {
      q = query(q, where('isActive', '==', options.active));
    }
    
    q = query(q, orderBy('name'));
    
    const querySnapshot = await getDocs(q);
    const templates: EmailTemplate[] = [];
    
    querySnapshot.forEach((doc) => {
      templates.push({ id: doc.id, ...doc.data() } as EmailTemplate);
    });
    
    // If no templates exist, create default ones
    if (templates.length === 0 && !options.category) {
      await initializeDefaultTemplates();
      return getEmailTemplates(options);
    }
    
    return templates;
  } catch (error) {
    console.error('Error getting email templates:', error);
    throw error;
  }
};

// Get single email template
export const getEmailTemplate = async (templateId: string): Promise<EmailTemplate | null> => {
  try {
    const docRef = doc(db, 'email_templates', templateId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as EmailTemplate;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting email template:', error);
    throw error;
  }
};

// Create email template
export const createEmailTemplate = async (
  templateData: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(emailTemplatesCollection, {
      ...templateData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Log audit event
    await auditHelpers.logDataExport(templateData.createdBy, '', 'email_template', {
      action: 'create',
      templateId: docRef.id,
      templateName: templateData.name
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating email template:', error);
    throw error;
  }
};

// Update email template
export const updateEmailTemplate = async (
  templateId: string,
  updates: Partial<EmailTemplate>,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, 'email_templates', templateId);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    
    // Log audit event
    await auditHelpers.logDataExport(userId, '', 'email_template', {
      action: 'update',
      templateId,
      updates
    });
  } catch (error) {
    console.error('Error updating email template:', error);
    throw error;
  }
};

// Process template content with variables
export const processEmailTemplate = (
  template: EmailTemplate,
  variables: Record<string, any>
): { subject: string; htmlContent: string; textContent: string } => {
  let subject = template.subject;
  let htmlContent = template.htmlContent;
  let textContent = template.textContent;
  
  // Replace variables in subject, HTML, and text content
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    const stringValue = String(value || '');
    
    subject = subject.replace(regex, stringValue);
    htmlContent = htmlContent.replace(regex, stringValue);
    textContent = textContent.replace(regex, stringValue);
  });
  
  return { subject, htmlContent, textContent };
};

// Send email notification
export const sendEmailNotification = async (
  templateId: string,
  recipientEmail: string,
  recipientName: string,
  variables: Record<string, any>,
  metadata: {
    category: string;
    relatedResource?: {
      type: string;
      id: string;
      name: string;
    };
    priority?: 'low' | 'normal' | 'high' | 'urgent';
  },
  userId: string,
  scheduledAt?: Date
): Promise<string> => {
  try {
    const template = await getEmailTemplate(templateId);
    if (!template) throw new Error('Email template not found');
    
    const { subject, htmlContent, textContent } = processEmailTemplate(template, variables);
    
    const notificationData: Omit<EmailNotification, 'id'> = {
      templateId,
      recipientEmail,
      recipientName,
      recipientId: variables.recipientId,
      subject,
      htmlContent,
      textContent,
      variables,
      status: 'pending',
      scheduledAt: scheduledAt ? Timestamp.fromDate(scheduledAt) : undefined,
      metadata: {
        category: metadata.category,
        relatedResource: metadata.relatedResource,
        priority: metadata.priority || 'normal',
      },
      createdBy: userId,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };
    
    const docRef = await addDoc(emailNotificationsCollection, notificationData);
    
    // In a real implementation, you would integrate with an email service
    // For now, we'll just mark it as sent
    await updateDoc(docRef, {
      status: 'sent',
      sentAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Log audit event
    await auditHelpers.logDataExport(userId, '', 'email_notification', {
      action: 'send',
      notificationId: docRef.id,
      templateId,
      recipientEmail,
      category: metadata.category
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};

// Get email notifications
export const getEmailNotifications = async (options: {
  recipientId?: string;
  status?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
} = {}): Promise<EmailNotification[]> => {
  try {
    let q = query(emailNotificationsCollection);
    
    if (options.recipientId) {
      q = query(q, where('recipientId', '==', options.recipientId));
    }
    
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }
    
    if (options.category) {
      q = query(q, where('metadata.category', '==', options.category));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    const querySnapshot = await getDocs(q);
    const notifications: EmailNotification[] = [];
    
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() } as EmailNotification);
    });
    
    return notifications;
  } catch (error) {
    console.error('Error getting email notifications:', error);
    throw error;
  }
};

// Initialize default templates
export const initializeDefaultTemplates = async (): Promise<void> => {
  try {
    for (const template of DEFAULT_EMAIL_TEMPLATES) {
      await addDoc(emailTemplatesCollection, {
        ...template,
        isActive: true,
        isSystem: true,
        createdBy: 'system',
        createdByName: 'System',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error initializing default templates:', error);
    throw error;
  }
};

// Helper functions for common email scenarios
export const sendWelcomeEmail = async (
  tenantId: string,
  tenantName: string,
  tenantEmail: string,
  leaseData: {
    propertyName: string;
    propertyAddress: string;
    unitLabel: string;
    leaseStartDate: string;
    leaseEndDate: string;
    rentAmount: string;
    paymentDueDate: string;
    agentName: string;
    agentContact: string;
  },
  userId: string
): Promise<string> => {
  const templates = await getEmailTemplates({ category: 'welcome', active: true });
  if (templates.length === 0) throw new Error('Welcome email template not found');
  
  return sendEmailNotification(
    templates[0].id,
    tenantEmail,
    tenantName,
    {
      tenantName,
      ...leaseData,
      emergencyContact: '+263 XXX XXX XXXX',
      paymentInstructions: 'Bank transfer or online portal',
    },
    {
      category: 'welcome',
      relatedResource: { type: 'tenant', id: tenantId, name: tenantName },
      priority: 'normal',
    },
    userId
  );
};

export const sendRentReminder = async (
  tenantId: string,
  tenantName: string,
  tenantEmail: string,
  paymentData: {
    propertyName: string;
    unitLabel: string;
    amountDue: string;
    dueDate: string;
    agentName: string;
    agentContact: string;
  },
  userId: string
): Promise<string> => {
  const templates = await getEmailTemplates({ category: 'reminder', active: true });
  if (templates.length === 0) throw new Error('Rent reminder template not found');
  
  return sendEmailNotification(
    templates[0].id,
    tenantEmail,
    tenantName,
    {
      tenantName,
      ...paymentData,
      paymentInstructions: 'Use the tenant portal or bank transfer',
    },
    {
      category: 'payment_reminder',
      relatedResource: { type: 'tenant', id: tenantId, name: tenantName },
      priority: 'high',
    },
    userId
  );
};

export const sendMaintenanceConfirmation = async (
  tenantId: string,
  tenantName: string,
  tenantEmail: string,
  requestData: {
    ticketNumber: string;
    propertyName: string;
    unitLabel: string;
    category: string;
    priority: string;
    submittedDate: string;
    description: string;
    agentName: string;
    agentContact: string;
  },
  userId: string
): Promise<string> => {
  const templates = await getEmailTemplates({ category: 'maintenance', active: true });
  if (templates.length === 0) throw new Error('Maintenance confirmation template not found');
  
  return sendEmailNotification(
    templates[0].id,
    tenantEmail,
    tenantName,
    {
      tenantName,
      ...requestData,
      expectedTimeframe: requestData.priority === 'urgent' ? '24 hours' : '3-5 business days',
      emergencyContact: '+263 XXX XXX XXXX',
    },
    {
      category: 'maintenance',
      relatedResource: { type: 'maintenance_request', id: requestData.ticketNumber, name: `Ticket ${requestData.ticketNumber}` },
      priority: requestData.priority as any,
    },
    userId
  );
};