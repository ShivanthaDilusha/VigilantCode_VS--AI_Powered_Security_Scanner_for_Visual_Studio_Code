<img width="1088" height="600" alt="image" src="https://github.com/user-attachments/assets/8c1c5e25-f792-4093-80b4-c77cd8611dbb" />

# VigilantCode_VS---AI_Powered_Security_Scanner_for_Visual_Studio_Code
I recently developed and published VigilantCode VS, a Visual Studio Code extension that brings proactive security analysis directly into the developer workflow. This tool integrates Google's Gemini 2.5 Flash AI model to provide real-time, context-aware vulnerability detection without disrupting the coding environment.

Key Features & Achievements:

*Real-Time AI Scanning: Captures selected code snippets from the active text editor. The extension securely transmits the data to the Gemini API for immediate, intelligent security analysis.

*Context-Aware Detection: Successfully identifies complex logical flaws and common web threats, including SQL injection and Cross-Site Scripting (XSS). The integration of the Gemini model overcomes the high false-positive rates associated with traditional static analysis tools.

*Custom UI Integration: Renders AI-generated security reports in a custom, styled WebView panel. The extension formats the AI responses using Markdown-to-HTML conversion to display vulnerability descriptions, risk severity levels, and remediation guidance directly within the IDE.

*Secure & Resilient Architecture: Implements comprehensive error handling to manage API quotas, authentication failures, and network timeouts gracefully. Environment variables and API keys are managed securely using the dotenv package. The system relies on asynchronous JavaScript execution to ensure the IDE main thread remains unblocked.

*Marketplace Deployment: The extension was successfully packaged using the VSCE tool. It is fully published and available for developers to download on the Visual Studio Marketplace.

How 'VigilantCode_VS' work ?
---
1)First you highlight your code snipet which you want to scan for vulnerabilities.

2)Then you click the 'Analyze Code' button in the upper right coner in the code window.

3)VS Code  API will connect to the Google AI API and analyze the code you selected.

4)Results will be displayed on a seperated window.

<img width="1337" height="929" alt="image" src="https://github.com/user-attachments/assets/04ac3330-14f2-4dbd-8826-281f447a3115" />

