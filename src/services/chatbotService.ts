import { attendanceService } from './attendanceService';
import { assignmentService } from './assignmentService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  message: string;
  timestamp: string;
  attachments?: string[];
  type?: 'text' | 'suggestion' | 'error';
}

interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  startedAt: string;
  lastActivityAt: string;
  userName?: string;
  userRole?: string;
}

interface SuggestedQuestion {
  text: string;
  category: string;
}

const CHAT_SESSIONS_DB_KEY = 'edu_sphere_chat_sessions';

class ChatbotService {
  private chatSessions: ChatSession[] = [];
  private suggestedQuestions: SuggestedQuestion[] = [
    { text: 'How do I mark attendance?', category: 'attendance' },
    { text: 'How do I submit an assignment?', category: 'assignments' },
    { text: 'How do I check my grades?', category: 'grades' },
    { text: 'What is my attendance percentage?', category: 'attendance' },
    { text: 'Can I resubmit an assignment?', category: 'assignments' },
    { text: 'How do I view notifications?', category: 'notifications' },
    { text: 'What features does this platform have?', category: 'general' },
    { text: 'How do I use the dashboard?', category: 'general' },
  ];

  private platformKnowledge = {
    features: [
      'Mark Attendance - Teachers can mark student attendance for each class',
      'Upload Assignments - Teachers can create and upload assignments with due dates',
      'Submit Assignments - Students can submit their assignments before the deadline',
      'Grade Submissions - Teachers can grade student submissions and provide feedback',
      'View Progress - Students can track their grades and attendance',
      'Notifications - Get real-time notifications about assignments and announcements',
      'View Analytics - Teachers can see student performance analytics',
      'Manage Courses - Teachers can organize courses and classes',
      'Track Submissions - Teachers can view and manage student submissions',
      'Account Management - Update your profile and settings'
    ],
    faqs: [
      {
        q: 'How do I mark attendance?',
        a: 'Go to the Teacher Dashboard, find the "Mark Attendance" card, select your class, and mark students as present, absent, late, or excused. Submit to save.'
      },
      {
        q: 'How do I submit an assignment?',
        a: 'Go to Student Dashboard, find your assignment in the "Assignments" section, click "View Details", attach your files, and click "Submit".'
      },
      {
        q: 'Can I resubmit an assignment?',
        a: 'Yes, you can resubmit until the due date. After the due date, it will be marked as "Late".'
      },
      {
        q: 'How do I check my grades?',
        a: 'Visit your Student Dashboard and check the "Recent Grades" section. You\'ll see all your graded submissions with feedback.'
      },
      {
        q: 'How do I upload course materials?',
        a: 'As a teacher, go to "Upload Material" in your dashboard to share study resources with your students.'
      },
      {
        q: 'What is my current attendance percentage?',
        a: 'You can check your attendance on your Student Dashboard. It shows present, absent, and overall percentage.'
      },
      {
        q: 'How do I view my notifications?',
        a: 'Click the notification bell icon in the top-right corner of any page to view your notifications. You\'ll see updates about assignments, grades, and attendance.'
      },
      {
        q: 'How do I grade student assignments?',
        a: 'Go to Teacher Dashboard, select the assignment you want to grade, click on student submissions, enter the grade and feedback, and click save.'
      },
      {
        q: 'Can I delete assignments?',
        a: 'Teachers can delete their own assignments from the Teacher Dashboard. Once deleted, students won\'t see it anymore.'
      },
      {
        q: 'How do I check student performance?',
        a: 'Teachers can view analytics and performance stats in the Teacher Dashboard. You can see attendance rates, assignment submission rates, and average grades.'
      },
      {
        q: 'What happens if I submit an assignment late?',
        a: 'Late submissions are automatically flagged as "Late" in the system. Teachers can still grade them, but they may apply late penalties per course policy.'
      },
      {
        q: 'How do I update my profile?',
        a: 'Click on your profile icon in the top-right corner and select "Edit Profile" to update your name, email, and other personal information.'
      },
      {
        q: 'Is there a way to get help?',
        a: 'Yes! I\'m here to help 24/7. You can ask me any questions about the platform, and I\'ll provide instant assistance.'
      },
      {
        q: 'How do I logout?',
        a: 'Click on your profile icon in the top-right corner and select "Logout". You\'ll be redirected to the login page.'
      },
      {
        q: 'Can students see their attendance records?',
        a: 'Yes, students can view their detailed attendance records on their Student Dashboard, including present, absent, and late entries.'
      },
      {
        q: 'How many attempts do I have for assignments?',
        a: 'You can submit assignments unlimited times until the due date. Once the deadline passes, submissions are marked as late.'
      },
      {
        q: 'Can teachers see student activity?',
        a: 'Teachers can see when assignments are submitted, view submission times, and track student progress through the Teacher Dashboard.'
      }
    ]
  };

  constructor() {
    this.loadData();
  }

  private loadData() {
    const stored = localStorage.getItem(CHAT_SESSIONS_DB_KEY);
    if (stored) {
      this.chatSessions = JSON.parse(stored);
    }
  }

  private saveData() {
    localStorage.setItem(CHAT_SESSIONS_DB_KEY, JSON.stringify(this.chatSessions));
  }

  // Create a new chat session
  createSession(userId: string, userName?: string, userRole?: string): ChatSession {
    const session: ChatSession = {
      id: `session_${Date.now()}`,
      userId,
      userName,
      userRole,
      messages: [],
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString()
    };

    this.chatSessions.push(session);
    this.saveData();
    return session;
  }

  // Get or create session for a user
  getOrCreateSession(userId: string, userName?: string, userRole?: string): ChatSession {
    let session = this.chatSessions.find(s => s.userId === userId);
    if (!session) {
      session = this.createSession(userId, userName, userRole);
    } else if (userName && !session.userName) {
      session.userName = userName;
      session.userRole = userRole;
      this.saveData();
    }
    return session;
  }

  // Get suggested questions for user
  getSuggestedQuestions(count: number = 4): SuggestedQuestion[] {
    return this.suggestedQuestions.slice(0, count);
  }

  // Add a message to session
  addMessage(sessionId: string, sender: 'user' | 'bot', message: string, attachments?: string[]): ChatMessage {
    const session = this.chatSessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender,
      message,
      timestamp: new Date().toISOString(),
      attachments
    };

    session.messages.push(chatMessage);
    session.lastActivityAt = new Date().toISOString();
    this.saveData();
    return chatMessage;
  }

  // Generate bot response based on user message
  generateResponse(userMessage: string, userId: string): string {
    const lowerMessage = userMessage.toLowerCase().trim();

    // Handle greetings
    if (/^(hi|hello|hey|greetings|what'?s up|howdy)[\s!?]*$/.test(lowerMessage)) {
      return 'Hello! 👋 Welcome to EduSphere AI Assistant. I\'m here to help you with:\n• Attendance management\n• Assignments and submissions\n• Grades and feedback\n• Platform navigation\n\nWhat can I help you with today?';
    }

    // Handle gratitude
    if (/thank(s| you)?|appreciate|grateful|much obliged/.test(lowerMessage)) {
      return 'You\'re welcome! 😊 I\'m always happy to help. Do you have any other questions?';
    }

    // Handle goodbye
    if (/^(bye|goodbye|see you|farewell|take care)[\s!?]*$/.test(lowerMessage)) {
      return 'Goodbye! Feel free to ask me anything anytime. Good luck! 👋';
    }

    // Handle 'what can you do' or similar
    if (/what can you (do|help with)|how can you help|capabilities|features you|what do you do/.test(lowerMessage)) {
      return `I can help you with:\n\n📋 **Attendance**\n• How to mark attendance\n• Checking attendance records\n• Understanding attendance percentage\n\n📝 **Assignments**\n• Creating assignments\n• Submitting assignments\n• Late submission policies\n• Resubmitting assignments\n\n⭐ **Grades**\n• Checking your grades\n• Understanding feedback\n• Grading submissions\n\n🎯 **General Help**\n• Platform features\n• Dashboard usage\n• Account management\n• Notifications\n\nJust ask me anything!`;
    }

    // Attendance-related queries - Enhanced
    if (/attendance|present|absent|late|excused|mark attendance|attendance rate|attendance percentage|class attendance/.test(lowerMessage)) {
      if (/mark|how|create|record/.test(lowerMessage)) {
        return '📋 **To Mark Attendance:**\n1. Go to Teacher Dashboard\n2. Click "Mark Attendance" card\n3. Select a class\n4. Mark each student:\n   - ✓ Present\n   - ✗ Absent\n   - ⏰ Late\n   - ℹ️ Excused\n5. Add remarks (optional)\n6. Click "Submit"\n\nAttendance records are automatically saved and students are notified.';
      }
      if (/check|see|view|history|record|view my/.test(lowerMessage)) {
        return '📊 **To Check Your Attendance:**\n1. Go to Student Dashboard\n2. Look at "Attendance" statistics at the top\n3. View detailed breakdown:\n   - Total Classes\n   - Present\n   - Absent\n   - Late\n   - Excused\n4. Click "Recent Attendance" for history\n\nYour attendance is updated after each class.';
      }
      if (/percentage|how.*calculated|improve|better/.test(lowerMessage)) {
        return '📈 **Attendance Percentage:**\n\nFormula: (Present + Late) / Total Classes × 100%\n\n**Tips to improve:**\n• Try to attend all classes\n• If late, inform your teacher\n• Check dashboard regularly\n• Reach out if you have conflicts\n\nContact your teacher if you have genuine reasons for absences.';
      }
      if (/can.*excuse|excused|reason|valid|valid reason/.test(lowerMessage)) {
        return '✅ **Excused Attendance:**\n\nTeachers can mark students as "Excused" for:\n• Medical reasons\n• Family emergencies\n• Official events\n• Other valid reasons\n\nExcused absences typically don\'t affect attendance percentage negatively. Always inform your teacher in advance if possible.';
      }
    }

    // Assignment-related queries - Enhanced
    if (/assignment|submit|submission|due date|deadline|task|work|project/.test(lowerMessage)) {
      if (/upload|create|add|new|prepare|teacher/.test(lowerMessage)) {
        return '📝 **To Create an Assignment (Teachers):**\n1. Go to Teacher Dashboard\n2. Click "Create Assignment" or "Upload Assignment"\n3. Fill in:\n   - Title (clear and descriptive)\n   - Description (guidelines)\n   - Due date and time\n   - Maximum marks\n4. Attach resources/materials\n5. Select courses/students\n6. Click "Create"\n\nStudents will be notified immediately!';
      }
      if (/submit|how.*student|submit.*how|upload file|turn in|hand in/.test(lowerMessage)) {
        return '📤 **To Submit an Assignment (Students):**\n1. Go to Student Dashboard\n2. Find "Assignments" section\n3. Click on the assignment\n4. Click "Submit" button\n5. Attach your files:\n   - Click "Choose File"\n   - Select document(s)\n6. Add notes (optional)\n7. Click "Submit Assignment"\n8. Confirmation message appears\n\nYou can resubmit unlimited times until the deadline!';
      }
      if (/resubmit|submit.*again|change submission|update|modify|correction|wrong file/.test(lowerMessage)) {
        return '🔄 **About Resubmissions:**\n\n✅ **Before Due Date:**\n• You can resubmit as many times as you want\n• Latest version will be evaluated\n• Submission time is when first submitted\n\n❌ **After Due Date:**\n• Marked as "Late"\n• Still can submit\n• Teachers may apply late penalties\n• Check course policy\n\nAlways submit before the deadline!';
      }
      if (/late|deadline|past due|overdue|after due/.test(lowerMessage)) {
        return '⏰ **Late Submission Policy:**\n\n• Submissions after due date = LATE\n• Still accepted (check with teacher)\n• May incur grade penalty\n• Late fee may apply (per course)\n• Teacher decides final grade\n\n**Pro tip:** Set reminders before deadlines!\nBetter to submit on time than risk penalties.';
      }
      if (/check status|see submission|submitted|confirm|verify/.test(lowerMessage)) {
        return '✓ **To Check Submission Status:**\n1. Go to Student Dashboard\n2. Find the assignment\n3. Look for status indicator:\n   - 📝 Pending\n   - ✓ Submitted\n   - ⏰ Late\n   - ⭐ Graded\n4. Click for details and feedback\n\nYou\'ll also receive notifications when teachers grade your work!';
      }
    }

    // Grading-related queries - Enhanced
    if (/grade|mark|score|evaluate|assessment|feedback|result|performance/.test(lowerMessage)) {
      if (/check|see|view|my|student/.test(lowerMessage)) {
        return '⭐ **To Check Your Grades:**\n1. Go to Student Dashboard\n2. Look for "Recent Grades" section\n3. View:\n   - Assignment name\n   - Score/marks\n   - Date graded\n   - Teacher feedback\n4. Click any grade for details\n5. Read feedback carefully\n\nGrades are updated as teachers evaluate your submissions.';
      }
      if (/give|provide|teacher|mark students|assign scores|evaluate/.test(lowerMessage)) {
        return '✏️ **To Grade Assignments (Teachers):**\n1. Go to Teacher Dashboard\n2. Select an assignment\n3. Click "Grade Submissions"\n4. For each submission:\n   - Review student work\n   - Enter score/marks\n   - Write feedback\n   - Optional: Add comments\n5. Click "Save Grade"\n6. Student gets notified\n\nProvide constructive feedback to help students improve!';
      }
      if (/feedback|comment|improve|comments/.test(lowerMessage)) {
        return '💬 **About Feedback:**\n\n✅ Teachers can provide:\n• Numerical grades\n• Written feedback\n• Comments on work\n• Areas for improvement\n• Praise for good work\n\n**How to receive feedback:**\n1. Check graded assignments\n2. Read all comments carefully\n3. Ask teacher if unclear\n4. Use feedback to improve\n\nFeedback helps you learn better!';
      }
    }

    // Notification-related queries
    if (/notification|notify|notify|alert|message|update|news|announcement/.test(lowerMessage)) {
      return '🔔 **About Notifications:**\n\n**You get notified when:**\n• New assignment created\n• Assignment deadline approaching\n• Your submission graded\n• Grades posted\n• Attendance marked\n• Teacher sends message\n• System updates\n\n**Check notifications:**\n1. Click notification bell 🔔 (top-right)\n2. View all updates\n3. Click to see details\n4. Mark as read\n\nEnable notifications in settings to stay updated!';
    }

    // Dashboard-related queries
    if (/dashboard|interface|homepage|main page|navigate/.test(lowerMessage)) {
      return '🏠 **About Your Dashboard:**\n\n**Student Dashboard shows:**\n• Attendance percentage\n• Recent grades\n• Upcoming assignments\n• Pending submissions\n• Notifications\n• Quick actions\n\n**Teacher Dashboard shows:**\n• Class performance\n• Pending assignments to grade\n• Attendance overview\n• Student submissions\n• Analytics\n• Course management\n\n**Admin Dashboard shows:**\n• System statistics\n• User management\n• Course management\n• Reports\n• System settings\n\nYour dashboard is personalized to your role!';
    }

    // Account/Profile queries
    if (/profile|account|edit|change|update|personal|information|name|email|password|settings/.test(lowerMessage)) {
      return '👤 **Account Management:**\n\n**To Update Profile:**\n1. Click your profile icon (top-right)\n2. Select "Edit Profile"\n3. Update:\n   - Name\n   - Email\n   - Phone\n   - Profile picture\n4. Click "Save Changes"\n\n**To Change Password:**\n1. Go to Settings\n2. Select "Security"\n3. Click "Change Password"\n4. Enter current password\n5. Enter new password\n6. Confirm new password\n7. Click "Update"\n\n**To Logout:**\n• Click profile icon\n• Select "Logout"\n• You\'ll be redirected to login';
    }

    // Platform features overview
    if (/what is|feature|capabilities|platform|edusphere|what.*platform|about/.test(lowerMessage)) {
      return `🎓 **EduSphere Features:**\n\n${this.platformKnowledge.features.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\n**Benefits:**\n✓ All-in-one education management\n✓ Real-time updates\n✓ Easy to use interface\n✓ 24/7 AI support\n✓ Secure and reliable\n\nEnjoy using EduSphere!`;
    }

    // Troubleshooting common issues
    if (/not working|bug|error|problem|issue|help|cannot|can't|doesn't work|broken/.test(lowerMessage)) {
      return '🔧 **Having Issues?**\n\n**Common Problems & Solutions:**\n\n❓ Can\'t submit assignment?\n→ Check file size and format\n→ Ensure deadline hasn\'t passed\n→ Try refreshing page\n\n❓ Grades not showing?\n→ Teacher hasn\'t graded yet\n→ Check notification for updates\n→ Refresh page\n\n❓ Attendance not updated?\n→ Teacher marks after class\n→ May take a few minutes\n→ Refresh your dashboard\n\n❓ Technical issues?\n→ Clear browser cache\n→ Try different browser\n→ Contact admin\n\n**Still having issues?**\nContact your administrator or teacher for help!';
    }

    // Advanced queries
    if (/analytics|report|statistics|performance|data|chart|trend/.test(lowerMessage)) {
      return '📊 **Analytics & Reports:**\n\n**Students can see:**\n• Personal attendance trends\n• Grade progression\n• Assignment completion status\n• Overall performance\n\n**Teachers can see:**\n• Class average grades\n• Attendance statistics\n• Student performance comparison\n• Submission rates\n• Class trends\n\n**How to access:**\n1. Go to Dashboard\n2. Look for "Analytics" section\n3. View charts and graphs\n4. Export reports (if available)\n\nData helps improve learning outcomes!';
    }

    // FAQ matching - enhanced with better scoring
    let bestMatch: { faq: typeof this.platformKnowledge.faqs[0]; score: number } | null = null;
    
    for (const faq of this.platformKnowledge.faqs) {
      const qLower = faq.q.toLowerCase();
      const qKeywords = qLower.split(/\s+/).filter(w => w.length > 3);
      const messageWords = lowerMessage.split(/\s+/);
      
      let matchCount = 0;
      for (const keyword of qKeywords) {
        if (messageWords.some(w => w.includes(keyword) || keyword.includes(w))) {
          matchCount++;
        }
      }
      
      if (matchCount > (bestMatch?.score || 1)) {
        bestMatch = { faq, score: matchCount };
      }
    }

    if (bestMatch) {
      return bestMatch.faq.a;
    }

    // Default helpful response
    return `I can help you with:\n\n📋 **Attendance:**\nHow to mark, check, or understand attendance\n\n📝 **Assignments:**\nSubmitting, creating, or resubmitting work\n\n⭐ **Grades:**\nChecking grades and feedback\n\n🎯 **General:**\nPlatform features and navigation\n\n🔔 **Notifications:**\nStaying updated\n\n**Try asking:**\n"How do I mark attendance?"\n"Can I resubmit an assignment?"\n"How do I check my grades?"\n\nOr select from suggested questions above!`;
  }

  // Get chat history for a session
  getChatHistory(sessionId): ChatMessage[] {
    const session = this.chatSessions.find(s => s.id === sessionId);
    return session?.messages || [];
  }

  // Send a message and get a response
  async sendMessage(sessionId: string, userMessage: string): Promise<{ userMessage: ChatMessage; botResponse: ChatMessage }> {
    // Add user message
    const userMsg = this.addMessage(sessionId, 'user', userMessage);

    // Generate bot response
    const responseText = this.generateResponse(userMessage, this.chatSessions.find(s => s.id === sessionId)?.userId || '');
    
    // Simulate slight delay for more natural feel
    await new Promise(resolve => setTimeout(resolve, 300));

    const botMsg = this.addMessage(sessionId, 'bot', responseText);

    return { userMessage: userMsg, botResponse: botMsg };
  }

  // Clear chat history
  clearHistory(sessionId: string): void {
    const session = this.chatSessions.find(s => s.id === sessionId);
    if (session) {
      session.messages = [];
      this.saveData();
    }
  }

  // Search knowledge base
  searchKnowledge(query: string): string[] {
    const results: string[] = [];
    const lowerQuery = query.toLowerCase();

    this.platformKnowledge.faqs.forEach(faq => {
      if (faq.q.toLowerCase().includes(lowerQuery) || faq.a.toLowerCase().includes(lowerQuery)) {
        results.push(`Q: ${faq.q}\nA: ${faq.a}`);
      }
    });

    return results;
  }
}

export const chatbotService = new ChatbotService();
