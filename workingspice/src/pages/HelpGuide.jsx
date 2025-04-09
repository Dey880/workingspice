import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/pages/help-guide.css';

export default function HelpGuide() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('general');
    const [activeSection, setActiveSection] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/user`, { 
                    withCredentials: true 
                });
                setUser(response.data.user);
            } catch (err) {
                console.error("Not logged in:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const toggleSection = (section) => {
        setActiveSection(activeSection === section ? null : section);
    };

    if (loading) {
        return <div>Loading help guide...</div>;
    }

    return (
        <div className="help-guide-container">
            <h1>Help Guide & FAQ</h1>
            
            <div className="guide-tabs">
                <button 
                    className={activeTab === 'general' ? 'active' : ''} 
                    onClick={() => setActiveTab('general')}
                >
                    General Help
                </button>
                <button 
                    className={activeTab === 'customers' ? 'active' : ''} 
                    onClick={() => setActiveTab('customers')}
                >
                    For Customers
                </button>
                {(user?.role === 'first-line' || user?.role === 'admin') && (
                    <button 
                        className={activeTab === 'first-line' ? 'active' : ''} 
                        onClick={() => setActiveTab('first-line')}
                    >
                        First-Line Support
                    </button>
                )}
                {(user?.role === 'second-line' || user?.role === 'admin') && (
                    <button 
                        className={activeTab === 'second-line' ? 'active' : ''} 
                        onClick={() => setActiveTab('second-line')}
                    >
                        Second-Line Support
                    </button>
                )}
                <button 
                    className={activeTab === 'faq' ? 'active' : ''} 
                    onClick={() => setActiveTab('faq')}
                >
                    FAQ
                </button>
                <button 
                    className={activeTab === 'sample-tickets' ? 'active' : ''} 
                    onClick={() => setActiveTab('sample-tickets')}
                >
                    Sample Tickets
                </button>
            </div>
            
            <div className="guide-content">
                {/* General Help */}
                {activeTab === 'general' && (
                    <div className="guide-section">
                        <h2>Welcome to WorkingSpice Helpdesk</h2>
                        <p>This help guide provides instructions for using our ticket management system, whether you're a customer reporting an issue or a support agent handling tickets.</p>
                        
                        <div className="accordion">
                            <div className="accordion-item">
                                <h3 onClick={() => toggleSection('overview')}>
                                    System Overview
                                    <span className="toggle-icon">{activeSection === 'overview' ? '−' : '+'}</span>
                                </h3>
                                {activeSection === 'overview' && (
                                    <div className="accordion-content">
                                        <p>WorkingSpice is a comprehensive helpdesk solution that allows:</p>
                                        <ul>
                                            <li>Customers to create and track support tickets</li>
                                            <li>First-line support to handle initial ticket reviews</li>
                                            <li>Second-line support to address complex technical issues</li>
                                            <li>Admins to manage the overall system and user permissions</li>
                                        </ul>
                                        <p>The system uses a tiered support approach to ensure efficient handling of all issues.</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="accordion-item">
                                <h3 onClick={() => toggleSection('navigation')}>
                                    Navigating the System
                                    <span className="toggle-icon">{activeSection === 'navigation' ? '−' : '+'}</span>
                                </h3>
                                {activeSection === 'navigation' && (
                                    <div className="accordion-content">
                                        <p>The main navigation menu provides access to:</p>
                                        <ul>
                                            <li><strong>Dashboard</strong>: View tickets relevant to your role</li>
                                            <li><strong>Profile</strong>: View your account information</li>
                                            <li><strong>Create Ticket</strong>: Submit a new support request</li>
                                            <li><strong>Admin Portal</strong>: For administrators only</li>
                                            <li><strong>Help</strong>: Access this help guide</li>
                                        </ul>
                                        <p>Click on any ticket to view its details and communication history.</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="accordion-item">
                                <h3 onClick={() => toggleSection('ticket-statuses')}>
                                    Understanding Ticket Statuses
                                    <span className="toggle-icon">{activeSection === 'ticket-statuses' ? '−' : '+'}</span>
                                </h3>
                                {activeSection === 'ticket-statuses' && (
                                    <div className="accordion-content">
                                        <p>Tickets progress through these statuses during their lifecycle:</p>
                                        <ul>
                                            <li><strong>Open</strong>: Newly created and awaiting initial review</li>
                                            <li><strong>In Progress</strong>: Currently being worked on by support</li>
                                            <li><strong>Resolved</strong>: Solution provided, awaiting confirmation</li>
                                            <li><strong>Closed</strong>: Issue completed and ticket finalized</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Customer Guide */}
                {activeTab === 'customers' && (
                    <div className="guide-section">
                        <h2>Customer Guide</h2>
                        <p>Learn how to create and manage your support tickets effectively.</p>
                        
                        <div className="accordion">
                            <div className="accordion-item">
                                <h3 onClick={() => toggleSection('create-ticket')}>
                                    Creating a New Ticket
                                    <span className="toggle-icon">{activeSection === 'create-ticket' ? '−' : '+'}</span>
                                </h3>
                                {activeSection === 'create-ticket' && (
                                    <div className="accordion-content">
                                        <ol>
                                            <li>From your dashboard, click the <strong>Create New Ticket</strong> button</li>
                                            <li>Fill in the ticket title with a brief description of your issue</li>
                                            <li>Select an appropriate priority level:
                                                <ul>
                                                    <li><strong>Low</strong>: Minor issue with minimal impact</li>
                                                    <li><strong>Medium</strong>: Issue affecting productivity but with workarounds</li>
                                                    <li><strong>High</strong>: Significant problem disrupting work</li>
                                                    <li><strong>Critical</strong>: Complete system failure or data loss risk</li>
                                                </ul>
                                            </li>
                                            <li>Choose a category (if enabled by the administrator)</li>
                                            <li>Provide a detailed description of the issue, including:
                                                <ul>
                                                    <li>Steps to reproduce the problem</li>
                                                    <li>What you expected to happen</li>
                                                    <li>What actually happened</li>
                                                    <li>Any error messages you received</li>
                                                </ul>
                                            </li>
                                            <li>Click <strong>Create Ticket</strong> to submit</li>
                                        </ol>
                                        <div className="tip-box">
                                            <strong>Tip:</strong> The more details you provide in your initial description, the faster our support team can assist you.
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="accordion-item">
                                <h3 onClick={() => toggleSection('track-ticket')}>
                                    Tracking Your Tickets
                                    <span className="toggle-icon">{activeSection === 'track-ticket' ? '−' : '+'}</span>
                                </h3>
                                {activeSection === 'track-ticket' && (
                                    <div className="accordion-content">
                                        <p>To check your ticket status:</p>
                                        <ol>
                                            <li>Go to your <strong>Dashboard</strong></li>
                                            <li>View all your tickets organized by status</li>
                                            <li>Click on any ticket to see its details and communication history</li>
                                        </ol>
                                        <p>You can see updates when support staff:
                                            <ul>
                                                <li>Add comments to your ticket</li>
                                                <li>Change the status of your ticket</li>
                                                <li>Request additional information</li>
                                            </ul>
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="accordion-item">
                                <h3 onClick={() => toggleSection('reply-ticket')}>
                                    Responding to Support
                                    <span className="toggle-icon">{activeSection === 'reply-ticket' ? '−' : '+'}</span>
                                </h3>
                                {activeSection === 'reply-ticket' && (
                                    <div className="accordion-content">
                                        <p>When support requests additional information:</p>
                                        <ol>
                                            <li>Open the ticket details page</li>
                                            <li>Scroll to the comments section at the bottom</li>
                                            <li>Type your response in the comment box</li>
                                            <li>Click <strong>Add Comment</strong> to send your reply</li>
                                        </ol>
                                        <div className="tip-box">
                                            <strong>Note:</strong> You cannot add comments to closed tickets. If you need to follow up on a closed ticket, please create a new one and reference the original ticket number.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* First Line Support Guide */}
                {activeTab === 'first-line' && (
                    <div className="guide-section">
                        <h2>First-Line Support Guide</h2>
                        <p>Instructions for handling initial ticket triage and customer support.</p>
                        
                        <div className="accordion">
                            <div className="accordion-item">
                                <h3 onClick={() => toggleSection('ticket-workflow')}>
                                    Ticket Workflow
                                    <span className="toggle-icon">{activeSection === 'ticket-workflow' ? '−' : '+'}</span>
                                </h3>
                                {activeSection === 'ticket-workflow' && (
                                    <div className="accordion-content">
                                        <p>As first-line support, follow this workflow:</p>
                                        <ol>
                                            <li><strong>Review new tickets:</strong> Check the dashboard for new open tickets</li>
                                            <li><strong>Initial assessment:</strong> Evaluate if the issue can be resolved at first-line level</li>
                                            <li><strong>Assign ownership:</strong> Assign the ticket to yourself if you'll handle it</li>
                                            <li><strong>Update status:</strong> Change status to "In Progress" while working on it</li>
                                            <li><strong>Communicate:</strong> Add comments to request clarification or provide updates</li>
                                            <li><strong>Resolve or escalate:</strong> Either resolve the ticket or escalate to second-line support</li>
                                        </ol>
                                    </div>
                                )}
                            </div>
                            
                            <div className="accordion-item">
                                <h3 onClick={() => toggleSection('first-line-responsibilities')}>
                                    Key Responsibilities
                                    <span className="toggle-icon">{activeSection === 'first-line-responsibilities' ? '−' : '+'}</span>
                                </h3>
                                {activeSection === 'first-line-responsibilities' && (
                                    <div className="accordion-content">
                                        <p>Your primary responsibilities include:</p>
                                        <ul>
                                            <li>Initial ticket review and customer communication</li>
                                            <li>Handling basic troubleshooting and common issues</li>
                                            <li>Collecting all necessary information for complex problems</li>
                                            <li>Managing ticket priorities appropriately</li>
                                            <li>Documenting all actions taken and customer communications</li>
                                        </ul>
                                        <div className="tip-box">
                                            <strong>Best Practice:</strong> Always update the ticket with detailed notes about your troubleshooting steps and findings, even if you need to escalate the ticket later.
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="accordion-item">
                                <h3 onClick={() => toggleSection('escalation-procedures')}>
                                    Escalation Procedures
                                    <span className="toggle-icon">{activeSection === 'escalation-procedures' ? '−' : '+'}</span>
                                </h3>
                                {activeSection === 'escalation-procedures' && (
                                    <div className="accordion-content">
                                        <p>Escalate tickets to second-line support when:</p>
                                        <ul>
                                            <li>The issue requires specialized technical knowledge</li>
                                            <li>Standard troubleshooting steps have been exhausted</li>
                                            <li>The issue involves system-wide problems</li>
                                            <li>You've collected all relevant information from the customer</li>
                                        </ul>
                                        <p>To escalate a ticket:</p>
                                        <ol>
                                            <li>Open the ticket details page</li>
                                            <li>Add a comment summarizing all troubleshooting completed</li>
                                            <li>Ask an administrator to change the support line to "Second Line"</li>
                                            <li>Inform the second-line team about the escalation</li>
                                        </ol>
                                        <p>Note: Only administrators can change the support line assignment.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Second Line Support Guide */}
                {activeTab === 'second-line' && (
                    <div className="guide-section">
                        <h2>Second-Line Support Guide</h2>
                        <p>Instructions for handling complex technical issues and escalated tickets.</p>
                        
                        <div className="accordion">
                            <div className="accordion-item">
                                <h3 onClick={() => toggleSection('second-line-workflow')}>
                                    Working with Escalated Tickets
                                    <span className="toggle-icon">{activeSection === 'second-line-workflow' ? '−' : '+'}</span>
                                </h3>
                                {activeSection === 'second-line-workflow' && (
                                    <div className="accordion-content">
                                        <p>When handling escalated tickets:</p>
                                        <ol>
                                            <li>Review the complete ticket history and first-line notes</li>
                                            <li>Assign the ticket to yourself</li>
                                            <li>Acknowledge receipt by adding a comment</li>
                                            <li>Perform advanced troubleshooting</li>
                                            <li>Document all technical steps taken</li>
                                            <li>Provide resolution or workaround</li>
                                            <li>Update ticket status to "Resolved" when complete</li>
                                        </ol>
                                        <div className="tip-box">
                                            <strong>Important:</strong> Always verify that first-line support has collected all necessary information before beginning advanced troubleshooting.
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="accordion-item">
                                <h3 onClick={() => toggleSection('technical-documentation')}>
                                    Technical Documentation
                                    <span className="toggle-icon">{activeSection === 'technical-documentation' ? '−' : '+'}</span>
                                </h3>
                                {activeSection === 'technical-documentation' && (
                                    <div className="accordion-content">
                                        <p>Comprehensive documentation is crucial for second-line support:</p>
                                        <ul>
                                            <li>Document all technical findings in ticket comments</li>
                                            <li>Include specific error codes and configuration details</li>
                                            <li>Explain the root cause of the issue when identified</li>
                                            <li>Detail the exact steps taken to resolve the problem</li>
                                            <li>Add notes about potential preventative measures</li>
                                        </ul>
                                        <p>This documentation helps:
                                            <ul>
                                                <li>Build a knowledge base for similar future issues</li>
                                                <li>Assist first-line support in handling similar cases</li>
                                                <li>Identify recurring problems that may need system-wide fixes</li>
                                            </ul>
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="accordion-item">
                                <h3 onClick={() => toggleSection('resolution-verification')}>
                                    Verifying Resolutions
                                    <span className="toggle-icon">{activeSection === 'resolution-verification' ? '−' : '+'}</span>
                                </h3>
                                {activeSection === 'resolution-verification' && (
                                    <div className="accordion-content">
                                        <p>Before marking a ticket as resolved:</p>
                                        <ol>
                                            <li>Verify the solution works in all relevant scenarios</li>
                                            <li>Document any configuration changes made</li>
                                            <li>Add a detailed explanation of the resolution for the customer</li>
                                            <li>Include any preventative advice to avoid future issues</li>
                                            <li>Request confirmation from the customer that the issue is resolved</li>
                                        </ol>
                                        <p>After setting status to "Resolved":</p>
                                        <ul>
                                            <li>The ticket will remain in "Resolved" status for customer confirmation</li>
                                            <li>If the customer confirms resolution, the ticket can be closed</li>
                                            <li>If the customer reports continued issues, reopen the ticket</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* FAQ Section */}
                {activeTab === 'faq' && (
                    <div className="guide-section">
                        <h2>Frequently Asked Questions</h2>
                        
                        <div className="accordion">
                            <div className="accordion-item">
                                <h3 onClick={() => toggleSection('faq1')}>
                                    I forgot my password. What should I do?
                                    <span className="toggle-icon">{activeSection === 'faq1' ? '−' : '+'}</span>
                                </h3>
                                {activeSection === 'faq1' && (
                                    <div className="accordion-content">
                                        <p>If you've forgotten your password:</p>
                                        <ol>
                                            <li>Please contact your system administrator</li>
                                            <li>Provide your username and email address</li>
                                            <li>The administrator will help reset your password</li>
                                        </ol>
                                        <p>For security reasons, we don't offer self-service password resets at this time.</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="accordion-item">
                                <h3 onClick={() => toggleSection('faq2')}>
                                    Can I update a ticket after submission?
                                    <span className="toggle-icon">{activeSection === 'faq2' ? '−' : '+'}</span>
                                </h3>
                                {activeSection === 'faq2' && (
                                    <div className="accordion-content">
                                        <p>Yes, you can update a ticket after submission by:</p>
                                        <ol>
                                            <li>Navigating to the ticket details page</li>
                                            <li>Adding new comments with additional information</li>
                                        </ol>
                                        <p>However, you cannot change the original title or description once submitted. Support staff can update these fields if necessary.</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="accordion-item">
                                <h3 onClick={() => toggleSection('faq3')}>
                                    What's the difference between "Resolved" and "Closed" status?
                                    <span className="toggle-icon">{activeSection === 'faq3' ? '−' : '+'}</span>
                                </h3>
                                {activeSection === 'faq3' && (
                                    <div className="accordion-content">
                                        <p><strong>Resolved</strong> means:</p>
                                        <ul>
                                            <li>Support has provided a solution</li>
                                            <li>Waiting for customer confirmation that the issue is fixed</li>
                                            <li>Additional comments can still be added</li>
                                        </ul>
                                        <p><strong>Closed</strong> means:</p>
                                        <ul>
                                            <li>The ticket has been completely addressed</li>
                                            <li>No further action is required</li>
                                            <li>No new comments can be added</li>
                                        </ul>
                                        <p>A resolved ticket will typically be closed after the customer confirms the solution works or after a period of inactivity.</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="accordion-item">
                                <h3 onClick={() => toggleSection('faq4')}>
                                    How do I know which priority to select?
                                    <span className="toggle-icon">{activeSection === 'faq4' ? '−' : '+'}</span>
                                </h3>
                                {activeSection === 'faq4' && (
                                    <div className="accordion-content">
                                        <p>Select priority based on impact and urgency:</p>
                                        <ul>
                                            <li><strong>Low</strong>: Minor inconvenience, no impact on work</li>
                                            <li><strong>Medium</strong>: Limited impact, workarounds available</li>
                                            <li><strong>High</strong>: Significant impact on productivity</li>
                                            <li><strong>Critical</strong>: Complete work stoppage or data loss risk</li>
                                        </ul>
                                        <p>Support staff may adjust the priority based on their assessment.</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="accordion-item">
                                <h3 onClick={() => toggleSection('faq5')}>
                                    Can I reopen a closed ticket?
                                    <span className="toggle-icon">{activeSection === 'faq5' ? '−' : '+'}</span>
                                </h3>
                                {activeSection === 'faq5' && (
                                    <div className="accordion-content">
                                        <p>No, closed tickets cannot be reopened. If you have a follow-up issue:</p>
                                        <ol>
                                            <li>Create a new ticket</li>
                                            <li>Reference the previous ticket number in your description</li>
                                            <li>Explain why the issue has returned or wasn't fully resolved</li>
                                        </ol>
                                        <p>This helps maintain a clear history and ensures proper routing of your new request.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Sample Tickets */}
                {activeTab === 'sample-tickets' && (
                    <div className="guide-section">
                        <h2>Sample Tickets & Responses</h2>
                        <p>These examples demonstrate well-written tickets and effective support responses.</p>
                        
                        <div className="sample-tickets">
                            <div className="sample-ticket">
                                <h3>Sample Ticket 1: Network Connectivity Issue</h3>
                                <div className="ticket-details">
                                    <p><strong>Title:</strong> Unable to connect to company VPN from home office</p>
                                    <p><strong>Priority:</strong> High</p>
                                    <p><strong>Description:</strong> Since this morning (April 8), I've been unable to connect to the company VPN from my home office. I've tried restarting my computer and router, but the VPN client shows "Connection timeout" after about 30 seconds. I was able to connect yesterday without any issues. This is preventing me from accessing internal systems needed for my work.</p>
                                </div>
                                <div className="ticket-response">
                                    <h4>Support Response:</h4>
                                    <p>Thank you for reporting this issue. I've checked our VPN logs and found that there was a configuration change made to the VPN server last night during maintenance that's affecting some users.</p>
                                    <p>To resolve this issue, please try these steps:</p>
                                    <ol>
                                        <li>Open the VPN client application</li>
                                        <li>Go to Settings {'>'} Connection</li>
                                        <li>Change the connection protocol from "Automatic" to "TCP"</li>
                                        <li>Save the settings and try connecting again</li>
                                    </ol>
                                    <p>If this doesn't resolve the issue, please let me know what error message you see after trying these steps. We're also working on a permanent fix that should be deployed by end of day.</p>
                                </div>
                            </div>
                            
                            <div className="sample-ticket">
                                <h3>Sample Ticket 2: Software Installation Problem</h3>
                                <div className="ticket-details">
                                    <p><strong>Title:</strong> Error installing project management software update</p>
                                    <p><strong>Priority:</strong> Medium</p>
                                    <p><strong>Description:</strong> I'm trying to install the latest update for our project management software (version 4.2.1), but it fails with error code E-1010. I've tried running the installer as administrator and temporarily disabling antivirus, but neither fixed the issue.</p>
                                </div>
                                <div className="ticket-response">
                                    <h4>Support Response:</h4>
                                    <p>I've researched error code E-1010 and identified that this typically occurs when there are temporary files from a previous installation attempt causing conflicts.</p>
                                    <p>Please follow these steps to clean up the temporary files and complete the installation:</p>
                                    <ol>
                                        <li>Close all instances of the project management software</li>
                                        <li>Go to Control Panel {'>'} Programs and Features</li>
                                        <li>Look for any entries related to the software update and uninstall them</li>
                                        <li>Navigate to C:\Users\[YourUsername]\AppData\Local\Temp</li>
                                        <li>Delete any folders that start with "PMSoftware_"</li>
                                        <li>Restart your computer</li>
                                        <li>Try the installation again</li>
                                    </ol>
                                    <p>Please let me know if you're still encountering issues after following these steps.</p>
                                </div>
                            </div>
                            
                            <div className="sample-ticket">
                                <h3>Sample Ticket 3: Email Delivery Failure</h3>
                                <div className="ticket-details">
                                    <p><strong>Title:</strong> Emails to external clients bouncing back</p>
                                    <p><strong>Priority:</strong> Critical</p>
                                    <p><strong>Description:</strong> Since approximately 10:30 AM today, emails sent to clients outside our organization are bouncing back with "Relay Access Denied" errors. This is affecting our entire marketing team (5 people). This is impacting our campaign delivery schedule and client communications.</p>
                                </div>
                                <div className="ticket-response">
                                    <h4>Support Response:</h4>
                                    <p>Thank you for reporting this critical issue. After investigating our mail server logs, I've found that our email relay configuration was incorrectly modified during this morning's scheduled maintenance.</p>
                                    <p>I've taken the following actions to resolve this issue:</p>
                                    <ol>
                                        <li>Restored the correct mail relay configuration</li>
                                        <li>Restarted the mail services</li>
                                        <li>Verified successful test email delivery to external addresses</li>
                                        <li>Added a monitor to alert us if this issue recurs</li>
                                    </ol>
                                    <p>All outgoing emails should now be delivering properly. Please attempt to resend any critical communications that were affected. If you notice any emails still bouncing, please let me know immediately.</p>
                                    <p>The system will also automatically attempt to deliver any messages that were queued during the outage over the next hour.</p>
                                </div>
                            </div>
                            
                            <div className="sample-ticket">
                                <h3>Sample Ticket 4: Database Performance Issue</h3>
                                <div className="ticket-details">
                                    <p><strong>Title:</strong> Database queries extremely slow during end-of-month reporting</p>
                                    <p><strong>Priority:</strong> High</p>
                                    <p><strong>Description:</strong> Our financial reporting database is running much slower than normal during our month-end reporting process. Queries that typically take 1-2 minutes are now taking 15+ minutes to complete. This started yesterday afternoon and is affecting our ability to generate reports for the executive meeting tomorrow. We haven't made any recent changes to our reporting queries.</p>
                                </div>
                                <div className="ticket-response">
                                    <h4>Support Response:</h4>
                                    <p>I've analyzed the database performance metrics and identified several issues contributing to the slowdown:</p>
                                    <ol>
                                        <li>The database server is experiencing high I/O wait times due to fragmented indexes</li>
                                        <li>Several large temporary tables are consuming significant memory</li>
                                        <li>Two long-running queries from the marketing department are blocking some of your reporting queries</li>
                                    </ol>
                                    <p>I've taken the following immediate actions:</p>
                                    <ul>
                                        <li>Optimized the most critical indexes for your reporting tables</li>
                                        <li>Added memory to the database server</li>
                                        <li>Worked with the marketing team to reschedule their large data extract</li>
                                    </ul>
                                    <p>These changes have improved query performance by approximately 70%. For a more permanent solution, I recommend scheduling a maintenance window this weekend to rebuild all indexes and update statistics.</p>
                                </div>
                            </div>
                            
                            <div className="sample-ticket">
                                <h3>Sample Ticket 5: Login Issue</h3>
                                <div className="ticket-details">
                                    <p><strong>Title:</strong> Cannot access the customer portal after account activation</p>
                                    <p><strong>Priority:</strong> Medium</p>
                                    <p><strong>Description:</strong> I received an account activation email yesterday and set up my password, but when I try to log in today, I get an "Invalid credentials" error. I've tried multiple times and verified I'm using the correct email address and password. I need access to submit my quarterly report by Friday.</p>
                                </div>
                                <div className="ticket-response">
                                    <h4>Support Response:</h4>
                                    <p>Thank you for reporting this issue. I've checked your account in our system and found that while your account was created successfully, it hasn't been fully activated in our authentication system.</p>
                                    <p>I've completed the activation process on the backend, and you should now be able to log in. Please try these steps:</p>
                                    <ol>
                                        <li>Clear your browser cache and cookies</li>
                                        <li>Close and reopen your browser</li>
                                        <li>Navigate to the login page</li>
                                        <li>Enter your email and password</li>
                                    </ol>
                                    <p>I've tested the login with a test account and confirmed it's working properly. If you continue to experience issues, please let me know, and I can arrange a quick screen-sharing session to troubleshoot further.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}