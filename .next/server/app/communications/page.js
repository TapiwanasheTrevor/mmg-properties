(()=>{var e={};e.id=773,e.ids=[773],e.modules={72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},84770:e=>{"use strict";e.exports=require("crypto")},80665:e=>{"use strict";e.exports=require("dns")},17702:e=>{"use strict";e.exports=require("events")},92048:e=>{"use strict";e.exports=require("fs")},32615:e=>{"use strict";e.exports=require("http")},32694:e=>{"use strict";e.exports=require("http2")},98216:e=>{"use strict";e.exports=require("net")},19801:e=>{"use strict";e.exports=require("os")},55315:e=>{"use strict";e.exports=require("path")},35816:e=>{"use strict";e.exports=require("process")},76162:e=>{"use strict";e.exports=require("stream")},74026:e=>{"use strict";e.exports=require("string_decoder")},82452:e=>{"use strict";e.exports=require("tls")},17360:e=>{"use strict";e.exports=require("url")},21764:e=>{"use strict";e.exports=require("util")},71568:e=>{"use strict";e.exports=require("zlib")},98061:e=>{"use strict";e.exports=require("node:assert")},92761:e=>{"use strict";e.exports=require("node:async_hooks")},72254:e=>{"use strict";e.exports=require("node:buffer")},40027:e=>{"use strict";e.exports=require("node:console")},6005:e=>{"use strict";e.exports=require("node:crypto")},65714:e=>{"use strict";e.exports=require("node:diagnostics_channel")},15673:e=>{"use strict";e.exports=require("node:events")},88849:e=>{"use strict";e.exports=require("node:http")},42725:e=>{"use strict";e.exports=require("node:http2")},87503:e=>{"use strict";e.exports=require("node:net")},38846:e=>{"use strict";e.exports=require("node:perf_hooks")},39630:e=>{"use strict";e.exports=require("node:querystring")},84492:e=>{"use strict";e.exports=require("node:stream")},31764:e=>{"use strict";e.exports=require("node:tls")},41041:e=>{"use strict";e.exports=require("node:url")},47261:e=>{"use strict";e.exports=require("node:util")},93746:e=>{"use strict";e.exports=require("node:util/types")},24086:e=>{"use strict";e.exports=require("node:worker_threads")},65628:e=>{"use strict";e.exports=require("node:zlib")},11330:(e,t,a)=>{"use strict";a.r(t),a.d(t,{GlobalError:()=>n.a,__next_app__:()=>m,originalPathname:()=>p,pages:()=>c,routeModule:()=>u,tree:()=>d}),a(2221),a(36852),a(35866);var r=a(23191),s=a(88716),i=a(37922),n=a.n(i),o=a(95231),l={};for(let e in o)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>o[e]);a.d(t,l);let d=["",{children:["communications",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(a.bind(a,2221)),"/Users/memimal/Desktop/PROJECTS/MMG/mmg-platform/app/communications/page.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(a.bind(a,36852)),"/Users/memimal/Desktop/PROJECTS/MMG/mmg-platform/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(a.t.bind(a,35866,23)),"next/dist/client/components/not-found-error"]}],c=["/Users/memimal/Desktop/PROJECTS/MMG/mmg-platform/app/communications/page.tsx"],p="/communications/page",m={require:a,loadChunk:()=>Promise.resolve()},u=new r.AppPageRouteModule({definition:{kind:s.x.APP_PAGE,page:"/communications/page",pathname:"/communications",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},62682:(e,t,a)=>{Promise.resolve().then(a.bind(a,76079))},76079:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>J});var r=a(10326),s=a(19395),i=a(35047),n=a(17577),o=a(33071),l=a(567),d=a(90772),c=a(54432),p=a(45842),m=a(87673),u=a(34474),x=a(43273),y=a(65304),g=a(79210),h=a(40617),b=a(37358),v=a(24061),f=a(67048),j=a(29798),N=a(28916),w=a(36283),C=a(5932),q=a(83855),k=a(41291),D=a(30361),P=a(41137),M=a(88307),E=a(12714),S=a(69508),T=a(98091),Z=a(69436),A=a(45804),I=a(76),L=a(20902),R=a(63324);let _=(0,I.hJ)(L.db,"email_templates"),z=(0,I.hJ)(L.db,"email_notifications"),O=[{name:"Welcome New Tenant",description:"Welcome email sent to new tenants when they join",category:"welcome",subject:"Welcome to {{propertyName}} - Your Tenancy Begins!",htmlContent:`
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
    `,textContent:`
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
    `,variables:[{name:"tenantName",label:"Tenant Name",description:"Full name of the tenant",required:!0},{name:"propertyName",label:"Property Name",description:"Name of the property",required:!0},{name:"propertyAddress",label:"Property Address",description:"Full address of the property",required:!0},{name:"unitLabel",label:"Unit Label",description:"Unit number or identifier",required:!0},{name:"leaseStartDate",label:"Lease Start Date",description:"When the lease begins",required:!0},{name:"leaseEndDate",label:"Lease End Date",description:"When the lease ends",required:!0},{name:"rentAmount",label:"Rent Amount",description:"Monthly rent amount",required:!0},{name:"paymentDueDate",label:"Payment Due Date",description:"Day of month rent is due",required:!0},{name:"agentName",label:"Agent Name",description:"Property manager name",required:!0},{name:"agentContact",label:"Agent Contact",description:"Property manager contact info",required:!0},{name:"emergencyContact",label:"Emergency Contact",description:"Emergency contact information",required:!0},{name:"paymentInstructions",label:"Payment Instructions",description:"How to pay rent",required:!0}]},{name:"Rent Payment Reminder",description:"Reminder sent to tenants about upcoming rent payments",category:"reminder",subject:"Rent Payment Reminder - Due {{dueDate}}",htmlContent:`
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
    `,textContent:`
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
    `,variables:[{name:"tenantName",label:"Tenant Name",description:"Full name of the tenant",required:!0},{name:"propertyName",label:"Property Name",description:"Name of the property",required:!0},{name:"unitLabel",label:"Unit Label",description:"Unit number or identifier",required:!0},{name:"amountDue",label:"Amount Due",description:"Total amount due",required:!0},{name:"dueDate",label:"Due Date",description:"When payment is due",required:!0},{name:"paymentInstructions",label:"Payment Instructions",description:"How to make payment",required:!0},{name:"agentName",label:"Agent Name",description:"Property manager name",required:!0},{name:"agentContact",label:"Agent Contact",description:"Property manager contact",required:!0}]},{name:"Maintenance Request Confirmation",description:"Confirmation sent when a maintenance request is submitted",category:"maintenance",subject:"Maintenance Request Received - Ticket #{{ticketNumber}}",htmlContent:`
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
    `,textContent:`
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
    `,variables:[{name:"ticketNumber",label:"Ticket Number",description:"Maintenance request ticket number",required:!0},{name:"propertyName",label:"Property Name",description:"Name of the property",required:!0},{name:"unitLabel",label:"Unit Label",description:"Unit number or identifier",required:!0},{name:"category",label:"Category",description:"Type of maintenance request",required:!0},{name:"priority",label:"Priority",description:"Priority level of the request",required:!0},{name:"submittedDate",label:"Submitted Date",description:"When the request was submitted",required:!0},{name:"description",label:"Description",description:"Description of the issue",required:!0},{name:"expectedTimeframe",label:"Expected Timeframe",description:"When maintenance is expected",required:!0},{name:"emergencyContact",label:"Emergency Contact",description:"Emergency contact information",required:!0},{name:"agentName",label:"Agent Name",description:"Property manager name",required:!0},{name:"agentContact",label:"Agent Contact",description:"Property manager contact",required:!0}]},{name:"Lease Expiration Notice",description:"Notice sent to tenants about upcoming lease expiration",category:"lease",subject:"Important: Your Lease Expires on {{expirationDate}}",htmlContent:`
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
    `,textContent:`
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
    `,variables:[{name:"propertyName",label:"Property Name",description:"Name of the property",required:!0},{name:"unitLabel",label:"Unit Label",description:"Unit number or identifier",required:!0},{name:"expirationDate",label:"Expiration Date",description:"When the lease expires",required:!0},{name:"daysUntilExpiration",label:"Days Until Expiration",description:"Number of days until lease expires",required:!0},{name:"currentRent",label:"Current Rent",description:"Current monthly rent amount",required:!0},{name:"leaseStartDate",label:"Lease Start Date",description:"When the current lease started",required:!0},{name:"renewalTerms",label:"Renewal Terms",description:"Proposed renewal terms",required:!1},{name:"noticeRequired",label:"Notice Required",description:"Days of notice required",required:!0},{name:"noticeDeadline",label:"Notice Deadline",description:"Deadline to provide notice",required:!0},{name:"moveOutInspectionDate",label:"Move-out Inspection Date",description:"When move-out inspection will occur",required:!0},{name:"daysToRespond",label:"Days to Respond",description:"Days tenant has to respond",required:!0},{name:"agentName",label:"Agent Name",description:"Property manager name",required:!0},{name:"agentContact",label:"Agent Contact",description:"Property manager contact",required:!0}]}],U=async(e={})=>{try{let t=(0,I.IO)(_);e.category&&(t=(0,I.IO)(t,(0,I.ar)("category","==",e.category))),void 0!==e.active&&(t=(0,I.IO)(t,(0,I.ar)("isActive","==",e.active))),t=(0,I.IO)(t,(0,I.Xo)("name"));let a=await (0,I.PL)(t),r=[];if(a.forEach(e=>{r.push({id:e.id,...e.data()})}),0===r.length&&!e.category)return await G(),U(e);return r}catch(e){throw console.error("Error getting email templates:",e),e}},W=async e=>{try{let t=(0,I.JU)(L.db,"email_templates",e),a=await (0,I.QT)(t);if(a.exists())return{id:a.id,...a.data()};return null}catch(e){throw console.error("Error getting email template:",e),e}},Q=async e=>{try{let t=await (0,I.ET)(_,{...e,createdAt:(0,I.Bt)(),updatedAt:(0,I.Bt)()});return await R.Cv.logDataExport(e.createdBy,"","email_template",{action:"create",templateId:t.id,templateName:e.name}),t.id}catch(e){throw console.error("Error creating email template:",e),e}},Y=async(e,t,a)=>{try{let r=(0,I.JU)(L.db,"email_templates",e);await (0,I.r7)(r,{...t,updatedAt:(0,I.Bt)()}),await R.Cv.logDataExport(a,"","email_template",{action:"update",templateId:e,updates:t})}catch(e){throw console.error("Error updating email template:",e),e}},V=(e,t)=>{let a=e.subject,r=e.htmlContent,s=e.textContent;return Object.entries(t).forEach(([e,t])=>{let i=RegExp(`{{${e}}}`,"g"),n=String(t||"");a=a.replace(i,n),r=r.replace(i,n),s=s.replace(i,n)}),{subject:a,htmlContent:r,textContent:s}},B=async(e,t,a,r,s,i,n)=>{try{let o=await W(e);if(!o)throw Error("Email template not found");let{subject:l,htmlContent:d,textContent:c}=V(o,r),p={templateId:e,recipientEmail:t,recipientName:a,recipientId:r.recipientId,subject:l,htmlContent:d,textContent:c,variables:r,status:"pending",scheduledAt:n?I.EK.fromDate(n):void 0,metadata:{category:s.category,relatedResource:s.relatedResource,priority:s.priority||"normal"},createdBy:i,createdAt:(0,I.Bt)(),updatedAt:(0,I.Bt)()},m=await (0,I.ET)(z,p);return await (0,I.r7)(m,{status:"sent",sentAt:(0,I.Bt)(),updatedAt:(0,I.Bt)()}),await R.Cv.logDataExport(i,"","email_notification",{action:"send",notificationId:m.id,templateId:e,recipientEmail:t,category:s.category}),m.id}catch(e){throw console.error("Error sending email notification:",e),e}},H=async(e={})=>{try{let t=(0,I.IO)(z);e.recipientId&&(t=(0,I.IO)(t,(0,I.ar)("recipientId","==",e.recipientId))),e.status&&(t=(0,I.IO)(t,(0,I.ar)("status","==",e.status))),e.category&&(t=(0,I.IO)(t,(0,I.ar)("metadata.category","==",e.category))),t=(0,I.IO)(t,(0,I.Xo)("createdAt","desc")),e.limit&&(t=(0,I.IO)(t,limit(e.limit)));let a=await (0,I.PL)(t),r=[];return a.forEach(e=>{r.push({id:e.id,...e.data()})}),r}catch(e){throw console.error("Error getting email notifications:",e),e}},G=async()=>{try{for(let e of O)await (0,I.ET)(_,{...e,isActive:!0,isSystem:!0,createdBy:"system",createdByName:"System",createdAt:(0,I.Bt)(),updatedAt:(0,I.Bt)()})}catch(e){throw console.error("Error initializing default templates:",e),e}};function F(){let{user:e}=(0,s.aC)(),[t,a]=(0,n.useState)([]),[i,I]=(0,n.useState)([]),[L,R]=(0,n.useState)(null),[_,z]=(0,n.useState)(!0),[O,G]=(0,n.useState)(!1),[F,J]=(0,n.useState)(""),[X,$]=(0,n.useState)(""),[K,ee]=(0,n.useState)("templates"),[et,ea]=(0,n.useState)(!1),[er,es]=(0,n.useState)(!1),[ei,en]=(0,n.useState)(!1),[eo,el]=(0,n.useState)({search:"",category:"",status:""}),[ed,ec]=(0,n.useState)({name:"",description:"",category:"general",subject:"",htmlContent:"",textContent:"",variables:[],isActive:!0}),[ep,em]=(0,n.useState)({recipientEmail:e?.email||"",recipientName:e?.name||"",testVariables:{}}),[eu,ex]=(0,n.useState)({}),ey=async()=>{z(!0);try{let[e,t]=await Promise.all([U(),H({limit:50})]);a(e),I(t)}catch(e){J(e.message)}finally{z(!1)}},eg=async()=>{if(e){G(!0),J("");try{await Q({...ed,isSystem:!1,createdBy:e.id,createdByName:e.name}),$("Email template created successfully!"),ea(!1),ec({name:"",description:"",category:"general",subject:"",htmlContent:"",textContent:"",variables:[],isActive:!0}),await ey()}catch(e){J(e.message)}finally{G(!1)}}},eh=async()=>{if(e&&L){G(!0),J("");try{await Y(L.id,ed,e.id),$("Email template updated successfully!"),await ey();let t=await W(L.id);R(t)}catch(e){J(e.message)}finally{G(!1)}}},eb=async()=>{if(e&&L)try{await B(L.id,ep.recipientEmail,ep.recipientName,ep.testVariables,{category:"test",priority:"low"},e.id),$("Test email sent successfully!"),en(!1),await ey()}catch(e){J(e.message)}},ev=e=>{R(e);let t={};e.variables.forEach(e=>{t[e.name]=e.defaultValue||`[${e.label}]`}),ex(t),es(!0)},ef=e=>{R(e),ec({name:e.name,description:e.description,category:e.category,subject:e.subject,htmlContent:e.htmlContent,textContent:e.textContent,variables:e.variables,isActive:e.isActive}),ea(!0)},ej=(e,t,a)=>{ec(r=>({...r,variables:r.variables.map((r,s)=>s===e?{...r,[t]:a}:r)}))},eN=e=>{ec(t=>({...t,variables:t.variables.filter((t,a)=>a!==e)}))},ew=e=>{let t={notification:h.Z,reminder:b.Z,welcome:v.Z,maintenance:f.Z,lease:j.Z,payment:N.Z,inspection:w.Z,general:C.Z}[e]||C.Z;return r.jsx(t,{className:"w-4 h-4"})},eC=e=>({notification:"bg-blue-100 text-blue-800",reminder:"bg-orange-100 text-orange-800",welcome:"bg-green-100 text-green-800",maintenance:"bg-yellow-100 text-yellow-800",lease:"bg-purple-100 text-purple-800",payment:"bg-red-100 text-red-800",inspection:"bg-indigo-100 text-indigo-800",general:"bg-gray-100 text-gray-800"})[e]||"bg-gray-100 text-gray-800",eq=e=>({pending:"bg-yellow-100 text-yellow-800",sent:"bg-blue-100 text-blue-800",delivered:"bg-green-100 text-green-800",failed:"bg-red-100 text-red-800",bounced:"bg-red-100 text-red-800"})[e]||"bg-gray-100 text-gray-800",ek=t.filter(e=>(!eo.search||!!e.name.toLowerCase().includes(eo.search.toLowerCase())||!!e.description.toLowerCase().includes(eo.search.toLowerCase()))&&(!eo.category||e.category===eo.category)),eD=i.filter(e=>(!eo.search||!!e.subject.toLowerCase().includes(eo.search.toLowerCase())||!!e.recipientEmail.toLowerCase().includes(eo.search.toLowerCase()))&&(!eo.status||e.status===eo.status));return _?(0,r.jsxs)("div",{className:"space-y-6",children:[r.jsx(y.O,{className:"h-8 w-64"}),r.jsx("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[1,2,3].map(e=>r.jsx(y.O,{className:"h-32"},e))})]}):(0,r.jsxs)("div",{className:"space-y-6",children:[(0,r.jsxs)("div",{className:"flex justify-between items-center",children:[(0,r.jsxs)("div",{children:[r.jsx("h2",{className:"text-2xl font-bold tracking-tight",children:"Email Templates & Communications"}),r.jsx("p",{className:"text-muted-foreground",children:"Manage email templates and view communication history"})]}),(0,r.jsxs)(d.z,{onClick:()=>ea(!0),children:[r.jsx(q.Z,{className:"mr-2 h-4 w-4"}),"New Template"]})]}),F&&(0,r.jsxs)(x.bZ,{variant:"destructive",children:[r.jsx(k.Z,{className:"h-4 w-4"}),r.jsx(x.X,{children:F})]}),X&&(0,r.jsxs)(x.bZ,{children:[r.jsx(D.Z,{className:"h-4 w-4"}),r.jsx(x.X,{children:X})]}),(0,r.jsxs)(g.mQ,{value:K,onValueChange:ee,className:"w-full",children:[(0,r.jsxs)(g.dr,{className:"grid w-full grid-cols-2",children:[(0,r.jsxs)(g.SP,{value:"templates",children:["Email Templates (",t.length,")"]}),(0,r.jsxs)(g.SP,{value:"notifications",children:["Email History (",i.length,")"]})]}),(0,r.jsxs)(g.nU,{value:"templates",className:"space-y-4",children:[(0,r.jsxs)(o.Zb,{children:[r.jsx(o.Ol,{children:(0,r.jsxs)(o.ll,{className:"flex items-center",children:[r.jsx(P.Z,{className:"mr-2 h-4 w-4"}),"Filters"]})}),r.jsx(o.aY,{children:(0,r.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[r.jsx("div",{className:"space-y-2",children:(0,r.jsxs)("div",{className:"relative",children:[r.jsx(M.Z,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"}),r.jsx(c.I,{placeholder:"Search templates...",value:eo.search,onChange:e=>el(t=>({...t,search:e.target.value})),className:"pl-9"})]})}),r.jsx("div",{className:"space-y-2",children:(0,r.jsxs)(u.Ph,{value:eo.category,onValueChange:e=>el(t=>({...t,category:e})),children:[r.jsx(u.i4,{children:r.jsx(u.ki,{placeholder:"All Categories"})}),(0,r.jsxs)(u.Bw,{children:[r.jsx(u.Ql,{value:"",children:"All Categories"}),r.jsx(u.Ql,{value:"notification",children:"Notification"}),r.jsx(u.Ql,{value:"reminder",children:"Reminder"}),r.jsx(u.Ql,{value:"welcome",children:"Welcome"}),r.jsx(u.Ql,{value:"maintenance",children:"Maintenance"}),r.jsx(u.Ql,{value:"lease",children:"Lease"}),r.jsx(u.Ql,{value:"payment",children:"Payment"}),r.jsx(u.Ql,{value:"inspection",children:"Inspection"}),r.jsx(u.Ql,{value:"general",children:"General"})]})]})})]})})]}),r.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:ek.map(e=>(0,r.jsxs)(o.Zb,{className:"hover:shadow-md transition-shadow",children:[r.jsx(o.Ol,{children:(0,r.jsxs)("div",{className:"flex justify-between items-start",children:[(0,r.jsxs)("div",{className:"space-y-1",children:[r.jsx(o.ll,{className:"text-lg",children:e.name}),r.jsx(o.SZ,{children:e.description})]}),(0,r.jsxs)("div",{className:"flex space-x-1",children:[(0,r.jsxs)(l.C,{className:eC(e.category),children:[ew(e.category),r.jsx("span",{className:"ml-1",children:e.category})]}),e.isSystem&&r.jsx(l.C,{variant:"outline",children:"System"})]})]})}),r.jsx(o.aY,{children:(0,r.jsxs)("div",{className:"space-y-3",children:[(0,r.jsxs)("div",{className:"text-sm text-muted-foreground",children:[r.jsx("strong",{children:"Subject:"})," ",e.subject]}),(0,r.jsxs)("div",{className:"text-xs text-muted-foreground",children:["Variables: ",e.variables.length," | Created: ",(0,A.WU)(e.createdAt.toDate(),"MMM dd, yyyy")]}),(0,r.jsxs)("div",{className:"flex justify-between",children:[(0,r.jsxs)("div",{className:"flex space-x-1",children:[(0,r.jsxs)(d.z,{variant:"outline",size:"sm",onClick:()=>ev(e),children:[r.jsx(E.Z,{className:"w-3 h-3 mr-1"}),"Preview"]}),!e.isSystem&&(0,r.jsxs)(d.z,{variant:"outline",size:"sm",onClick:()=>ef(e),children:[r.jsx(S.Z,{className:"w-3 h-3 mr-1"}),"Edit"]})]}),r.jsx(l.C,{variant:e.isActive?"default":"secondary",children:e.isActive?"Active":"Inactive"})]})]})})]},e.id))}),0===ek.length&&r.jsx(o.Zb,{children:r.jsx(o.aY,{className:"flex items-center justify-center h-32",children:(0,r.jsxs)("div",{className:"text-center",children:[r.jsx(C.Z,{className:"mx-auto h-8 w-8 text-gray-400 mb-2"}),r.jsx("p",{className:"text-muted-foreground",children:"No templates found"})]})})})]}),(0,r.jsxs)(g.nU,{value:"notifications",className:"space-y-4",children:[(0,r.jsxs)(o.Zb,{children:[r.jsx(o.Ol,{children:(0,r.jsxs)(o.ll,{className:"flex items-center",children:[r.jsx(P.Z,{className:"mr-2 h-4 w-4"}),"Filters"]})}),r.jsx(o.aY,{children:(0,r.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[r.jsx("div",{className:"space-y-2",children:(0,r.jsxs)("div",{className:"relative",children:[r.jsx(M.Z,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"}),r.jsx(c.I,{placeholder:"Search emails...",value:eo.search,onChange:e=>el(t=>({...t,search:e.target.value})),className:"pl-9"})]})}),r.jsx("div",{className:"space-y-2",children:(0,r.jsxs)(u.Ph,{value:eo.status,onValueChange:e=>el(t=>({...t,status:e})),children:[r.jsx(u.i4,{children:r.jsx(u.ki,{placeholder:"All Statuses"})}),(0,r.jsxs)(u.Bw,{children:[r.jsx(u.Ql,{value:"",children:"All Statuses"}),r.jsx(u.Ql,{value:"pending",children:"Pending"}),r.jsx(u.Ql,{value:"sent",children:"Sent"}),r.jsx(u.Ql,{value:"delivered",children:"Delivered"}),r.jsx(u.Ql,{value:"failed",children:"Failed"}),r.jsx(u.Ql,{value:"bounced",children:"Bounced"})]})]})})]})})]}),r.jsx("div",{className:"space-y-3",children:eD.map(e=>r.jsx(o.Zb,{children:(0,r.jsxs)(o.aY,{className:"pt-4",children:[(0,r.jsxs)("div",{className:"flex justify-between items-start mb-3",children:[(0,r.jsxs)("div",{children:[r.jsx("h4",{className:"font-semibold",children:e.subject}),(0,r.jsxs)("p",{className:"text-sm text-muted-foreground",children:["To: ",e.recipientName," (",e.recipientEmail,")"]})]}),(0,r.jsxs)("div",{className:"flex space-x-2",children:[r.jsx(l.C,{className:eq(e.status),children:e.status.toUpperCase()}),r.jsx(l.C,{className:eC(e.metadata.category),children:e.metadata.category})]})]}),(0,r.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground",children:[(0,r.jsxs)("div",{children:[r.jsx("strong",{children:"Sent:"})," ",(0,A.WU)(e.createdAt.toDate(),"MMM dd, yyyy HH:mm")]}),e.sentAt&&(0,r.jsxs)("div",{children:[r.jsx("strong",{children:"Delivered:"})," ",(0,A.WU)(e.sentAt.toDate(),"MMM dd, yyyy HH:mm")]}),(0,r.jsxs)("div",{children:[r.jsx("strong",{children:"Priority:"})," ",e.metadata.priority]})]}),e.errorMessage&&(0,r.jsxs)("div",{className:"mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700",children:[r.jsx("strong",{children:"Error:"})," ",e.errorMessage]})]})},e.id))}),0===eD.length&&r.jsx(o.Zb,{children:r.jsx(o.aY,{className:"flex items-center justify-center h-32",children:(0,r.jsxs)("div",{className:"text-center",children:[r.jsx(C.Z,{className:"mx-auto h-8 w-8 text-gray-400 mb-2"}),r.jsx("p",{className:"text-muted-foreground",children:"No email notifications found"})]})})})]})]}),et&&r.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",children:(0,r.jsxs)(o.Zb,{className:"w-full max-w-4xl max-h-[90vh] overflow-y-auto",children:[r.jsx(o.Ol,{children:r.jsx(o.ll,{children:L?"Edit Email Template":"Create New Email Template"})}),(0,r.jsxs)(o.aY,{className:"space-y-4",children:[(0,r.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[(0,r.jsxs)("div",{className:"space-y-2",children:[r.jsx(p._,{children:"Template Name"}),r.jsx(c.I,{value:ed.name,onChange:e=>ec(t=>({...t,name:e.target.value})),placeholder:"Enter template name"})]}),(0,r.jsxs)("div",{className:"space-y-2",children:[r.jsx(p._,{children:"Category"}),(0,r.jsxs)(u.Ph,{value:ed.category,onValueChange:e=>ec(t=>({...t,category:e})),children:[r.jsx(u.i4,{children:r.jsx(u.ki,{})}),(0,r.jsxs)(u.Bw,{children:[r.jsx(u.Ql,{value:"notification",children:"Notification"}),r.jsx(u.Ql,{value:"reminder",children:"Reminder"}),r.jsx(u.Ql,{value:"welcome",children:"Welcome"}),r.jsx(u.Ql,{value:"maintenance",children:"Maintenance"}),r.jsx(u.Ql,{value:"lease",children:"Lease"}),r.jsx(u.Ql,{value:"payment",children:"Payment"}),r.jsx(u.Ql,{value:"inspection",children:"Inspection"}),r.jsx(u.Ql,{value:"general",children:"General"})]})]})]})]}),(0,r.jsxs)("div",{className:"space-y-2",children:[r.jsx(p._,{children:"Description"}),r.jsx(c.I,{value:ed.description,onChange:e=>ec(t=>({...t,description:e.target.value})),placeholder:"Brief description of this template"})]}),(0,r.jsxs)("div",{className:"space-y-2",children:[r.jsx(p._,{children:"Subject Line"}),r.jsx(c.I,{value:ed.subject,onChange:e=>ec(t=>({...t,subject:e.target.value})),placeholder:"Email subject (use {{variable}} for dynamic content)"})]}),(0,r.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[(0,r.jsxs)("div",{className:"space-y-2",children:[r.jsx(p._,{children:"HTML Content"}),r.jsx(m.g,{value:ed.htmlContent,onChange:e=>ec(t=>({...t,htmlContent:e.target.value})),placeholder:"HTML email content",rows:8})]}),(0,r.jsxs)("div",{className:"space-y-2",children:[r.jsx(p._,{children:"Text Content"}),r.jsx(m.g,{value:ed.textContent,onChange:e=>ec(t=>({...t,textContent:e.target.value})),placeholder:"Plain text email content",rows:8})]})]}),(0,r.jsxs)("div",{className:"space-y-2",children:[(0,r.jsxs)("div",{className:"flex justify-between items-center",children:[r.jsx(p._,{children:"Variables"}),(0,r.jsxs)(d.z,{variant:"outline",size:"sm",onClick:()=>{ec(e=>({...e,variables:[...e.variables,{name:"",label:"",description:"",required:!0,defaultValue:""}]}))},children:[r.jsx(q.Z,{className:"w-3 h-3 mr-1"}),"Add Variable"]})]}),r.jsx("div",{className:"space-y-2 max-h-48 overflow-y-auto",children:ed.variables.map((e,t)=>(0,r.jsxs)("div",{className:"grid grid-cols-12 gap-2 items-end",children:[r.jsx("div",{className:"col-span-3",children:r.jsx(c.I,{placeholder:"Variable name",value:e.name,onChange:e=>ej(t,"name",e.target.value)})}),r.jsx("div",{className:"col-span-3",children:r.jsx(c.I,{placeholder:"Display label",value:e.label,onChange:e=>ej(t,"label",e.target.value)})}),r.jsx("div",{className:"col-span-4",children:r.jsx(c.I,{placeholder:"Description",value:e.description,onChange:e=>ej(t,"description",e.target.value)})}),r.jsx("div",{className:"col-span-1",children:r.jsx("input",{type:"checkbox",checked:e.required,onChange:e=>ej(t,"required",e.target.checked)})}),r.jsx("div",{className:"col-span-1",children:r.jsx(d.z,{variant:"outline",size:"sm",onClick:()=>eN(t),children:r.jsx(T.Z,{className:"w-3 h-3"})})})]},t))})]}),(0,r.jsxs)("div",{className:"flex items-center space-x-2",children:[r.jsx("input",{type:"checkbox",id:"isActive",checked:ed.isActive,onChange:e=>ec(t=>({...t,isActive:e.target.checked}))}),r.jsx(p._,{htmlFor:"isActive",children:"Template is active"})]}),(0,r.jsxs)("div",{className:"flex justify-end space-x-2",children:[r.jsx(d.z,{variant:"outline",onClick:()=>ea(!1),children:"Cancel"}),r.jsx(d.z,{onClick:L?eh:eg,disabled:O,children:O?"Saving...":L?"Update Template":"Create Template"})]})]})]})}),er&&L&&r.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",children:(0,r.jsxs)(o.Zb,{className:"w-full max-w-4xl max-h-[90vh] overflow-y-auto",children:[r.jsx(o.Ol,{children:(0,r.jsxs)("div",{className:"flex justify-between items-center",children:[(0,r.jsxs)(o.ll,{children:["Preview: ",L.name]}),(0,r.jsxs)("div",{className:"flex space-x-2",children:[(0,r.jsxs)(d.z,{variant:"outline",onClick:()=>{R(L),en(!0)},children:[r.jsx(Z.Z,{className:"w-4 h-4 mr-2"}),"Send Test"]}),r.jsx(d.z,{variant:"outline",onClick:()=>es(!1),children:"Close"})]})]})}),(0,r.jsxs)(o.aY,{className:"space-y-4",children:[r.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:L.variables.map(e=>(0,r.jsxs)("div",{className:"space-y-2",children:[r.jsx(p._,{children:e.label}),r.jsx(c.I,{placeholder:e.description,value:eu[e.name]||"",onChange:t=>ex(a=>({...a,[e.name]:t.target.value}))})]},e.name))}),(0,r.jsxs)("div",{className:"space-y-4",children:[(0,r.jsxs)("div",{children:[r.jsx(p._,{children:"Subject"}),r.jsx("div",{className:"p-3 bg-gray-50 rounded border",children:V(L,eu).subject})]}),(0,r.jsxs)("div",{children:[r.jsx(p._,{children:"HTML Preview"}),r.jsx("div",{className:"p-4 bg-white border rounded max-h-96 overflow-y-auto",dangerouslySetInnerHTML:{__html:V(L,eu).htmlContent}})]})]})]})]})}),ei&&L&&r.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",children:(0,r.jsxs)(o.Zb,{className:"w-full max-w-md",children:[r.jsx(o.Ol,{children:r.jsx(o.ll,{children:"Send Test Email"})}),(0,r.jsxs)(o.aY,{className:"space-y-4",children:[(0,r.jsxs)("div",{className:"space-y-2",children:[r.jsx(p._,{children:"Recipient Email"}),r.jsx(c.I,{type:"email",value:ep.recipientEmail,onChange:e=>em(t=>({...t,recipientEmail:e.target.value})),placeholder:"test@example.com"})]}),(0,r.jsxs)("div",{className:"space-y-2",children:[r.jsx(p._,{children:"Recipient Name"}),r.jsx(c.I,{value:ep.recipientName,onChange:e=>em(t=>({...t,recipientName:e.target.value})),placeholder:"Test User"})]}),(0,r.jsxs)("div",{className:"space-y-2",children:[r.jsx(p._,{children:"Test Variables (JSON format)"}),r.jsx(m.g,{value:JSON.stringify(ep.testVariables,null,2),onChange:e=>{try{let t=JSON.parse(e.target.value);em(e=>({...e,testVariables:t}))}catch{}},placeholder:'{"tenantName": "John Doe", "propertyName": "Test Property"}',rows:4})]}),(0,r.jsxs)("div",{className:"flex justify-end space-x-2",children:[r.jsx(d.z,{variant:"outline",onClick:()=>en(!1),children:"Cancel"}),(0,r.jsxs)(d.z,{onClick:eb,children:[r.jsx(Z.Z,{className:"w-4 h-4 mr-2"}),"Send Test"]})]})]})]})})]})}function J(){let{user:e,loading:t}=(0,s.aC)();return t?r.jsx("div",{children:"Loading..."}):(e||(0,i.redirect)("/login"),["admin","agent"].includes(e.role))?r.jsx("div",{className:"max-w-7xl mx-auto p-6",children:r.jsx(F,{})}):r.jsx("div",{className:"flex items-center justify-center min-h-screen",children:(0,r.jsxs)("div",{className:"text-center",children:[r.jsx("h1",{className:"text-2xl font-bold text-gray-900 mb-2",children:"Access Denied"}),r.jsx("p",{className:"text-gray-600",children:"You don't have permission to manage communications."})]})})}},79210:(e,t,a)=>{"use strict";a.d(t,{SP:()=>d,dr:()=>l,mQ:()=>o,nU:()=>c});var r=a(10326),s=a(17577),i=a(28407),n=a(77863);let o=i.fC,l=s.forwardRef(({className:e,...t},a)=>r.jsx(i.aV,{ref:a,className:(0,n.cn)("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",e),...t}));l.displayName=i.aV.displayName;let d=s.forwardRef(({className:e,...t},a)=>r.jsx(i.xz,{ref:a,className:(0,n.cn)("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",e),...t}));d.displayName=i.xz.displayName;let c=s.forwardRef(({className:e,...t},a)=>r.jsx(i.VY,{ref:a,className:(0,n.cn)("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",e),...t}));c.displayName=i.VY.displayName},37358:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});let r=(0,a(62881).Z)("Calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]])},30361:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});let r=(0,a(62881).Z)("CircleCheckBig",[["path",{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14",key:"g774vq"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]])},28916:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});let r=(0,a(62881).Z)("CreditCard",[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]])},36283:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});let r=(0,a(62881).Z)("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]])},41137:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});let r=(0,a(62881).Z)("Filter",[["polygon",{points:"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3",key:"1yg77f"}]])},29798:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});let r=(0,a(62881).Z)("House",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"1d0kgt"}]])},5932:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});let r=(0,a(62881).Z)("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]])},40617:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});let r=(0,a(62881).Z)("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]])},83855:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});let r=(0,a(62881).Z)("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]])},88307:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});let r=(0,a(62881).Z)("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]])},69436:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});let r=(0,a(62881).Z)("Send",[["path",{d:"m22 2-7 20-4-9-9-4Z",key:"1q3vgg"}],["path",{d:"M22 2 11 13",key:"nzbqef"}]])},69508:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});let r=(0,a(62881).Z)("SquarePen",[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]])},98091:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});let r=(0,a(62881).Z)("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]])},24061:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});let r=(0,a(62881).Z)("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]])},67048:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});let r=(0,a(62881).Z)("Wrench",[["path",{d:"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",key:"cbrjhi"}]])},2221:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>r});let r=(0,a(68570).createProxy)(String.raw`/Users/memimal/Desktop/PROJECTS/MMG/mmg-platform/app/communications/page.tsx#default`)}};var t=require("../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[100,825,423,344,804,506,407,307,488],()=>a(11330));module.exports=r})();