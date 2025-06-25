#Instructions
This file will describe for you how the Web App that we will create Works, for you to understand the context and the final usability of our system, this will be under the "Project Overview" section.
This file also includes how is the Tech Stack that we will use to create the Web App, this will be under the "Tech Stack" section.
This file also includes the funcionalities of the system, each funcionalitie can have multiple flows, and the flows are how we expect the interations between the user and the system, all of this will be under a section called "Core Funcionalities"
This file also includes all the specifications to create the tables of the database, including name of the columns, data types and relationships between tables. So if you are requested to create a table, you can find the table in the "Database" section, look for it and follow the rules and validations described in the table.   
This file also includes all the specifications to create the pages of the system, including name of the fields, validations and styles. So if you are requested to create a page for user interaction, you can find the page in the "Pages Description" section, look for it and follow the rules and validations described in the page. 
This file also includes some of the functions that will be used in the system. So if you are requested to create a function, look for it in the "Functions" section and follow the rules and validations described in the function.  
This file also includes all the templates that will be used in the system. So if you are requested to create an email template or a file template you can find the it in the "Templates" section, look for it and follow the rules and validations described in the template. 
This file also some best practices to be applyed furing the coding of the project, so always follow the rules and validations described in the "Aditional Notes" section.

#Project Overview
The Auction Management Tool Web App is designed to manage auctions for a private company. The procurement team of the company will have acess to the system in order to create / edit / delete auctions and all the related components as users, participants and others. They also should have a dashboard to see all the auctions and their status. Users can Sign Up, Login and Recover Password. To create a new auction we will have the option to upload a template or start from scratch. 

#Tech Stack
It is built using Next.js 15, Node.js 20, Tailwind CSS, Lucid Icons and modern and responsive UI.
For framework: Next.js
Authentication: NextAuth.js
Database: PostgreSQL
Email Provider: GOOGLE SMTP

#Core Funcionalities
1.Sign Up 
Components:
	Pages: Login Page; User Registration Page; 
	Flows: Sign Up Flow
        Flow Description:
		Entry Point: Login Page
			Screen: Login Page
			User Action: Click the Sign Up Link (Text: "Don’t have an account? Sign up")
			System Action: Redirect to User Registration Page
		     User Registration Page
			Screen: User Registration Page
			User Action: Fill the inputs Click the Sign Up Link (Text: "Don’t have an account? Sign up")
			System Action: Run the Decision Point action to proceed with the correct outcome
		     Decision Point: Valid Information
			Screen: User Registration Page
			System Action_01: If the user fill all the required fields with valid information the system send the email for "Email Validation Template - V0" and insert the data in the "users" table of the database
			System Action_02: If the user does not fill all the required fields with valid information the system should follow the rules and validations described in "User Registration Page" and do not allow the user to continue until all the required fields have valid information
		     User Registration Token Confirmation Page
			Screen: User Registration Token Confirmation Page
			User Action: Fill the inputs Click the Submit button 
			System Action: Run the Decision Point action to proceed with the correct outcome
		     Decision Point: Valid Information
			Screen: User Registration Token Confirmation Page
			System Action_01: If the user fill all the required fields with valid information the system will Log In redirecting the user to the Dashboard Page and insert the data ("is_verified"/"verified_since") in the "users" table of the database
			System Action_02: If the user does not fill all the required fields with valid information the system should follow the rules and validations described in "User Registration Token Confirmation Page" and do not allow the user to continue until all the required fields have valid information

2.Login
Components:
	Pages: Login Page; 
	Flows: Login Flow
        Flow Description:
	    Entry Point: Login Page
			Screen: Login Page
			User Action: Fill the inputs Click Login button
			System Action: Run the Decision Point action to proceed with the correct outcome
		        Decision Point: Valid Information
			Screen: Login Page
			System Action_01: If the user fill all the required fields with valid information the system should start a session and redirect he user to the Dashboard page
			System Action_02: If the user does not fill all the required fields with valid information the system should follow the rules and validations described in "Login Page" and do not allow the user to continue until all the required fields have valid information

3.Forgot Password
Components:
	Pages: Login Page; Reset Password Page; Reset Password Email Confirmation Page;
	Flows: Forgot Password Flow
        Flow Description:
	    Entry Point: Login Page
			Screen: Login Page
			User Action: Click the Forgot Password Link (Text: "Forgot Password")
			System Action: Redirect to Reset Password Email Confirmation Page
		     Reset Password Email Confirmation Page
			Screen: Reset Password Email Confirmation Page
			User Action: Fill the inputs Click the Send Code button
			System Action: Run the Decision Point action to proceed with the correct outcome
		     Decision Point: Valid Information
			Screen: Reset Password Email Confirmation Page
			System Action_01: If the user fill all the required fields with valid information the system send the email for "Email for Password Reset Template - V0" and insert the data in the "password_reset" table of the database
			System Action_02: If the user does not fill all the required fields with valid information the system should follow the rules and validations described in "Reset Password Email Configuration Page" and do not allow the user to continue until all the required fields have valid information
		     Reset Password Page
			Screen: Reset Password Page
			User Action: Fill the inputs Click the Submit button 
			System Action: Run the Decision Point action to proceed with the correct outcome
		     Decision Point: Valid Information
			Screen: Reset Password Page
			System Action_01: If the user fill all the required fields with valid information the system will redirect the user to the Login Page and insert the data ("hashed_password") in the "users" table of the database
			System Action_02: If the user does not fill all the required fields with valid information the system should follow the rules and validations described in "Reset Password Page" and do not allow the user to continue until all the required fields have valid information

4.New Auction Template
Components:
	Pages: New Auction Page; Confirm new Auction Page; New Auction Participants Page; New Auction Resume Page; Dashboard Page;
	Flows: Auction Flow
        Flow Description:
	    Entry Point: Dashboard Page
			Screen: Dashboard Page
			User Action: Click the New Auction Button (Text: "New Auction")
			System Action: Redirect to New Auction Page
		     New Auction Page
			Screen: New Auction Page
			User Action: Select "Template" in Check Box
			System Action: Allow the user to Download and / or Upload the Template File
		     New Auction Page
			Screen: New Auction Page
			User Action: Select Download Template Button (Text: "Download Template")
			System Action: Download the Template file and allow the user to save it, inform a sucess message and keep the screen in same page
		     New Auction Page
			Screen: New Auction Page
			User Action: Upload a Template using the Drag and Drop option or the Upload new Template button (Text: "+")
			System Action_01: If the user upload a file with all the fields with valid information (the screen should show a "progress bar" while run the validations described in uploadvalidations function) and return the specific message to the user acconding with the uploadvalidations function 
			System Action_02: If the user does not upload a file with all the fields with valid information the system should follow the rules and validations described in "Upload Template Page" and do not allow the user to continue until all the required fields have valid information
		     Confirm new Auction Page
			Screen: Confirm New Auction Page
			User Action: Edit any of the fileds
			System Action_01: If the user edit any of the fields with valid information (the screen should show a "progress bar" while run the validations described in uploadvalidations function) and return the specific message to the user acconding with the uploadvalidations function 
			System Action_02: If the user does not edit any of the fields the system should allow the user to Click Next Button (Text: "Next")
		     New Auction Participants Page	
			Screen: New Auction Participants Page
			User Action: Select the particpants from the list
			System Action_01: If the user select at least 03 participants from the list then allow the user to push Confirm new Auction Button (Text: "Confirm new Auction")
			System Action_02: If the user does not select at least 03 participants from the list the system should do not allow the user to continue
		     New Auction Resume Page 
			Screen: New Auction Resume Page
			User Action: See all the information without the option of editing it and click Start Auction Button (Text: "Start Auction")
			System Action: If the user select Start Auction Button show up a sucess message, start the "new auction" funcion and redirect the user to Dashboard Page

5.Register New Participant 
Components:
	Pages: Participant Page; Confirm new Participant Page;
	Flows: New Participant Flow
        Flow Description:
	    Entry Point: Participant Page
			Screen: Participant Page
			User Action: Click the Register New Participant Button (Text: "Register New Participant")
			System Action: Redirect to Confirm New Participant Page
		     Confirm New Participant Page
			Screen: Confirm New Participant Page
			User Action: Fill all the fields in the page and press Validate New Participant Button (Text: "Validate New Participant")
			System Action_01: If the user fill all the fields with valid information (the screen should show a "progress bar" while run the validations described in "participantvalidations" function) and return the specific message to the user acconding with the "participantvalidations" function 
			System Action_02: If the user does fill all the fields with valid information the system should follow the rules and validations described in "participantvalidations" function and do not allow the user to continue until all the required fields have valid information
		     Confirm new Participant Page
			Screen: Confirm New Participant Page
			User Action: Click Register Button (Text: "Register")
			System Action: Call the function "new_participant" and Show up a sucess message and redirect the user to Participant Page

#Database
##Set up PostgreSQL database
##Create the following tables in the database:
	1. users: This will be the main table and should have all the data needed to manage the users of the web app. The field "users_id" should appears in the tables password_reset to correlate the data from a specific user to the data in the other table. 

		**Column Name; Data Type; Nullable; Default; Description;
		 users_id; INTEGER; NOT NULL; SERIAL; Primary key, auto-incrementing integer; 
		 email; VARCHAR; NOT NULL; -; User's email address (must be unique);
		 hashed_password; VARCHAR; NOT NULL; -; Securely hashed password using bcrypt;
		 full_name; VARCHAR; NULL; NULL; User's full name (optional);
		 created_at; TIMESTAMP WITH TIME ZONE; NOT NULL; CURRENT_TIMESTAMP; When the user was created;
		 updated_at; TIMESTAMP WITH TIME ZONE; NOT NULL; CURRENT_TIMESTAMP; When the user had the last modification in "is_active" status;
		 is_active; BOOLEAN; NOT NULL; TRUE; Flag to indicate if the account is active;
		 active_since; TIMESTAMP WITH TIME ZONE; NOT NULL; CURRENT_TIMESTAMP; When the user was created, when the status "is_active" change, update this field;
		 verification_token; INTEGER; NULL; NULL; 6-digit code (100000-999999) for email verification (unique);
		 is_verified; BOOLEAN; NOT NULL; FALSE; Flag to indicate if email is verified;
		 verified_since: TIMESTAMP WITH TIME ZONE; NOT NULL; CURRENT_TIMESTAMP; When the user was verified;
	
	2. password_reset: This will be the table to control the attempts of a user to recover their password and the time that the user has to change the password before the code generated expires. 

		**Column Name; Data Type; Nullable; Default; Description;
		 pr_id; INTEGER; NOT NULL; SERIAL; Primary key, auto-incrementing integer;
		 users_id; INTEGER; NOT NULL; SERIAL; Primary key, from "users" table for the specific user;
		 pr_token; INTEGER; NULL; NULL; 6-digit code (100000-999999) for password recovery verification (unique);
		 pr_token_expires_at; TIMESTAMP WITH TIME ZONE; NULL; NULL; When the "pr_token" expires;
		 pr_token_locked_until; TIMESTAMP WITH TIME ZONE; NULL; NULL; Account locked for verification using this specific "pr_token" until this time;
		 pr_token_valid_until; TIMESTAMP WITH TIME ZONE; NULL; NULL; Account locked for verification using this specific "pr_token" after this time;
		 
	3. auction_request: This table will be used to control the requests of new auctions, the requests to edit a new auction, the requests to delete an auction. The field "auction_id" should appears in the tables auction_data to correlate the data from a specific user to the data in the other table. 

		**Column Name; Data Type; Nullable; Default; Description;
		 auction_id; INTEGER; NOT NULL; SERIAL; Primary key, auto-incrementing integer; 
		 users_id; INTEGER; NOT NULL; SERIAL; Primary key, from "users" table for the specific user;
		 created_at; TIMESTAMP WITH TIME ZONE; NOT NULL; CURRENT_TIMESTAMP; When the auction was created;
		 updated_at; TIMESTAMP WITH TIME ZONE; NOT NULL; CURRENT_TIMESTAMP; When the auction had the last modification in "is_active" status;
		 is_active; BOOLEAN; NOT NULL; TRUE; Flag to indicate if the auction is active;
		 active_since; TIMESTAMP WITH TIME ZONE; NOT NULL; CURRENT_TIMESTAMP; When the auction was created, when the status "is_active" change, update this field;
		 
	4. auction_data: This table will be used to control all the data from a specific auction. 

		**Column Name; Data Type; Nullable; Default; Description;
		 auction_id; INTEGER; NOT NULL; SERIAL; Primary key, auto-incrementing integer; 
		 auction_description; VARCHAR; NOT NULL; -; Auction Description; 
		 freight; VARCHAR; NOT NULL; -; Freight Type;
		 from; VARCHAR; NOT NULL; -; Auction starting City;
		 to; VARCHAR; NOT NULL; -; Auction ending city;
		 vehicle; VARCHAR; NOT NULL; -; Vehicle Type; ==> Include Checkconstraint ("Urban Cargo"; "Rural Cargo"; "Truck"; "Heavy Truck") and do not allow NULL option
		 type; VARCHAR; NOT NULL; -; Owned or Third Part Vehicle; ==> Include Checkconstraint ("Fleet"; "Third Part") and do not allow NULL option
		 tracking; VARCHAR; NOT NULL; -; Real Time Data from the Vehicle; ==> Include Checkconstraint ("Real Time"; "No") and do not allow NULL option
		 insurance; VARCHAR; NOT NULL; -; Load Insured or Not; ==> Include Checkconstraint ("Yes"; "No") and do not allow NULL option

	5. participants: This table will be used to control all the data from the participants registered in the system. 

		**Column Name; Data Type; Nullable; Default; Description;
		 participant_id; INTEGER; NOT NULL; SERIAL; Primary key, auto-incrementing integer; 
		 participant_name; VARCHAR; NOT NULL; -; Company Name;
		 email; VARCHAR; NOT NULL; -; User's email address (must be unique);
		 contact_name; VARCHAR; NOT NULL; -; Comercial Contact Name;
		 phone; INTEGER; NOT NULL -; Comercial Contact Phone Number;
		 created_at; TIMESTAMP WITH TIME ZONE; NOT NULL; CURRENT_TIMESTAMP; When the participant was created;
		 updated_at; TIMESTAMP WITH TIME ZONE; NOT NULL; CURRENT_TIMESTAMP; When the participant had the last modification in "is_active" status;
		 is_active; BOOLEAN; NOT NULL; TRUE; Flag to indicate if the account is active;
		 active_since; TIMESTAMP WITH TIME ZONE; NOT NULL; CURRENT_TIMESTAMP; When the participant was created, when the status "is_active" change, update this field;
		 
	6. participants_request: This table will be used to control the requests for new participants, the requests to edit the data from a participant, the requests to delete an participant. The field "participant_id" should appears in the tables participants to correlate the data from a specific participant to the data in the other table. 

		**Column Name; Data Type; Nullable; Default; Description;
		 participant_id; INTEGER; NOT NULL; SERIAL; Primary key, auto-incrementing integer; 
		 created_at; TIMESTAMP WITH TIME ZONE; NOT NULL; CURRENT_TIMESTAMP; When the participant was created;
		 updated_at; TIMESTAMP WITH TIME ZONE; NOT NULL; CURRENT_TIMESTAMP; When the participant had the last modification in "is_active" status;
		 is_active; BOOLEAN; NOT NULL; TRUE; Flag to indicate if the participant is active;
		 active_since; TIMESTAMP WITH TIME ZONE; NOT NULL; CURRENT_TIMESTAMP; When the participant was created, when the status "is_active" change, update this field;
		  
#Pages Description
	*Login Page: welcome message "Welcome to your standard Login Page"
	 - Fields
		 - Email input (required, must follow valid format)
		 - Password input (required, secure format, at least 12 characters, at least one uppercase letter,at least one lowercase letter, at least one number, at least one special character)
		 - "Forgot Password?" link
		 - "Sign Up" link
		 - Login button
	 - Form validation
	 - Validation and Errors
	 - Real-time validation on blur and input change
 	 - Show “Incorrect Password” if applicable
	 - Show “Plase enter a valid email” if applicable

	*User Registration Page: welcome message "Insert your informations to register"
		 - Fields
	 		- Email input (required, must follow valid format)
	 		- Password input (required, secure format with at least 12 caracters)
	 		- Confirm Password input (must match password)
	 		- Submit Button
			- "back" button (send back to Login Page)
	 	- Validation and Errors
	 	- Real-time validation on blur and input change
	 	- Show “Passwords do not match” while Password input and Confirm Password input does not match
	 	- Sends data to backend API

	*User Registration Token Confirmation Page: welcome message "Welcome confirm you information to validate your user"
		 - Fields
	 		- Email input (required, must follow valid format)
	 		- Verification Token input (required, must match the "verification_token" in "users" table of the database)
	 		- Password input (required, must match the "hashed_password" in "users" table of the database aplying the encryption)
	 		- Submit Button
			- "back" button (send back to Login Page)
	 	- Validation and Errors
	 	- Real-time validation on blur and input change
	 	- Show “Passwords do not match” while Password input and Confirm Password input does not match
	 	- Sends data to backend API
	
	*Reset Password Page: welcome message "Reset your Password"
	 - Fields
		 - Email input (required, must follow valid format)
		 - New Password input (required, secure format, at least 12 characters, at least one uppercase letter,at least one lowercase letter, at least one number, at least one special character)
 		 - Confirm New Password input (must match password)
		 - Validation Code input (must be the 6 digit code associated in the database to the request made by the user and the same code send by email)
 		 - Submit button (only allow activation in the passwords match and the email is associated to the Code in the database)
	 - Form validation
	 - Validation and Errors
	 - Real-time validation on blur and input change
 	 - Show “Incorrect Password” if applicable
	 - Show “Plase enter a valid email” if applicable

	*Reset Password Email Confirmation Page: welcome message "Confirm your request to reset your password"
	 - Fields
		 - Email input (required, must follow valid format)
 		 - "Send Code" button (only if the email is in the database, this code should be saved in a new table of the database associated to the time and date and email of the user request to be further validated)
 		 - "back" button (send back to Login Page)
	   	 - Validate if the email is in the database
	 	 - Show “Email not registered” if applicable
 	 - Form validation
	 - Validation and Errors
	 - Real-time validation on blur and input change
 	 - Show “Plase enter a valid email” if applicable

	*Dashboard Page: welcome message "Welcome to your session"
		 - Fields
	 		- User Email (show)
	 		- User Full Name (show) 
			- User active_since (show)
			- "Logout" button (Log out the sesion and redirect to Login Page)
			- "New Auction" button (redirect to New Auction Page)
			- Expandible Menu in left side with the Links to pages:
				- Users ("Users page")
				- Dashboards ("Dashboard page")
				- Auctions ("Auctions Page")
				- Participants ("Participant Page")
				- Start New Auction ("New Auction Page")

	*New Auction Page: welcome message "New Auction"
	 - Fields
		 - Auction Description input (required, must follow valid format)
 		 	- Check box "Template" is off:
 		 		- Freight (Drop down list with options: Truck Load; Less than Truck Load)
	   	 		- From (required, must follow valid format)
	 	 		- To (required, must follow valid format)
				- Vehicle (Allow multiple selection: Urban Cargo; Rural Cargo; Truck; Heavy Truck)
				- Type (Check only one of two options: Fleet; Third Part)
				- Tracking (Check only one of two options: Real Time; No)
				- Insurance (Check only one of two options: Yes; No)
			- Check box "Template" is on:
				- Icon with template file for download
				- Drag and Drop box for upload the template file
 	 	 - "back" button (send back to Dashboard Page)
		 - "next" button (send to Upload Template Page)
	 - Form validation
	 - Validation and Errors
	 - Real-time validation on blur and input change
	 - Expandible Menu in left side with the Links to pages:
				- Users ("Users page")
				- Dashboards ("Dashboard page")
				- Auctions ("Auctions Page")
				- Participants ("Participant Page")
				- Start New Auction ("New Auction Page")
 	 
	*Confirm new Auction Page: welcome message "Change the terms of your New Auction"
	 - Fields
		 - Auction Description input (required, must follow valid format)
 		 		- Freight (Drop down list with options: Truck Load; Less than Truck Load)
	   	 		- From (required, must follow valid format)
	 	 		- To (required, must follow valid format)
				- Vehicle (Allow multiple selection: Urban Cargo; Rural Cargo; Truck; Heavy Truck)
				- Type (Check only one of two options: Fleet; Third Part)
				- Tracking (Check only one of two options: Real Time; No)
				- Insurance (Check only one of two options: Yes; No)
		  	        - "back" button (send back to Dashboard Page)
		                - "next" button (send to Upload Template Page)
	 	- Form validation
	 	- Validation and Errors
	 	- Real-time validation on blur and input change
		- Expandible Menu in left side with the Links to pages:
				- Users ("Users page")
				- Dashboards ("Dashboard page")
				- Auctions ("Auctions Page")
				- Participants ("Participant Page")
				- Start New Auction ("New Auction Page")

	*New Auction Participants Page: welcome message "List of all Participants"
	 - This page is composed by two big square boxes, first one in left side contains all the Participants that are in table participants of the database and have the column is_active = Yes. The second one is side by side with the first one but in Right side, and contains none of the participants.
	 - The user can click in each one of the participants one by one and push the ">" button that is in the middle of the boxes to make the participant move to the second box
	 - The user can click in the ">>" button that is in the middle of the boxes to make all the participants move to the second box
	 - The user can click in multiple participants and push the ">" button that is in the middle of the boxes to make all the participants selected move to the second box
	 - Expandible Menu in left side with the Links to pages:
				- Users ("Users page")
				- Dashboards ("Dashboard page")
				- Auctions ("Auctions Page")
				- Participants ("Participant Page")
				- Start New Auction ("New Auction Page")

	*New Auction Resume Page: welcome message "Confirm the terms of your New Auction"
	 - Fields
		 - Auction Description (required, must follow valid format)
 		 		- Freight (Drop down list with options: Truck Load; Less than Truck Load)
	   	 		- From (required, must follow valid format)
	 	 		- To (required, must follow valid format)
				- Vehicle (Allow multiple selection: Urban Cargo; Rural Cargo; Truck; Heavy Truck)
				- Type (Check only one of two options: Fleet; Third Part)
				- Tracking (Check only one of two options: Real Time; No)
				- Insurance (Check only one of two options: Yes; No)
		  	        - "back" button (send back to Dashboard Page)
		                - "Start Auction" button (in table "auction_request" of the database, change the status of "is_active" field to "yes" and "updated_at" with current timestamp, call new_Auction function)
	 	- Expandible Menu in left side with the Links to pages:
				- Users ("Users page")
				- Dashboards ("Dashboard page")
				- Auctions ("Auctions Page")
				- Participants ("Participant Page")
				- Start New Auction ("New Auction Page")

	*Participant Page: welcome message "List of Participants"
	 - The page should display a list with all current participants that have "is_active" row marked as "yes" in "participants" table of the database
	 - Fields
		 - Participant Name input (required, must follow valid format)
 		 		- Email (required, must follow valid format)
	   	 		- Contact Name (required, must follow valid format)
				- Phone Contact (required, must follow valid format)
				- "back" button (send back to Dashboard Page)
		                - "Register" button (call the function "participantvalidationdata" and if returns a sucess, then in table "participants" of the database, change the status of "is_active" field to "yes" and "updated_at" with current timestamp)
	 	- Expandible Menu in left side with the Links to pages:
				- Users ("Users page")
				- Dashboards ("Dashboard page")
				- Auctions ("Auctions Page")
				- Participants ("Participant Page")
				- Start New Auction ("New Auction Page")

	*Confirm new Participant Page: welcome message "Confirm the information of your New Participant"
	 - Fields
		 - Participant Name input (required, must follow valid format)
 		 		- Email (required, must follow valid format)
	   	 		- Contact Name (required, must follow valid format)
				- Phone Contact (required, must follow valid format)
				- "back" button (send back to Dashboard Page)
		                - "Register" button (call the function "participantvalidationdata" and if returns a sucess, then in table "participants" of the database, change the status of "is_active" field to "yes" and "updated_at" with current timestamp)
	 	- Expandible Menu in left side with the Links to pages:
				- Users ("Users page")
				- Dashboards ("Dashboard page")
				- Auctions ("Auctions Page")
				- Participants ("Participant Page")
				- Start New Auction ("New Auction Page")

	*Users Page: welcome message "Welcome to your profile"
	 - The page should display the profile of the current user incluing a photo and the fields:
		 - "User" (data from "users" table, column "full_name")
		 - "Email" (data from "users" table, column "email")
		 - "User Creation" (data from "users" table, column "created_at")
		 - "Verified" (data from "users" table, column "is_verified")
		 - "Active" (data from "users" table, column "is_active")
 	- Expandible Menu in left side with the Links to pages:
				- Users ("Users page")
				- Dashboards ("Dashboard page")
				- Auctions ("Auctions Page")
				- Participants ("Participant Page")
				- Start New Auction ("New Auction Page")

	*Auctions Page: welcome message "Valid Auctions in Progress"
	 - The page should display a list of al existing auctions in "auction_data" table of the database, with the following fields:
		 "Auction Number" (data from "auction_data" table, column "auction_id") 
		 "From" (data from "auction_data" table, column "from") 
		 "To" (data from "auction_data" table, column "to") 
		 "Status" (data from "auction_data" table, column "is_active")
	 - Expandible Menu in left side with the Links to pages:
				- Users ("Users page")
				- Dashboards ("Dashboard page")
				- Auctions ("Auctions Page")
				- Participants ("Participant Page")
				- Start New Auction ("New Auction Page")

#Functions

UploadValidations: When this function is called, the system should first extract the data from the file uploaded using the Templateextractdata, then validate the data extracted against the rules using Templatevalidationdata and return a list of errors for the file. 
Trigger to call the function ==> In New Auction Flow, every time a user uploads a file in page New Auction Page

Templateextractdata: When this function is called, the system should open the file uploaded by the user, extract the data from the specific cells and atribute it to the tags, call #templatevalidationdata function, then save it in the rows with the same name of the tags in the auction_data of the database.
	Trigger to call the function ==> Called by UploadValidations function
	Set the specific Tag for each field in template file:
	Tag = freight ==> Row 2, Column C
	Tag = from ==> Row 3, Column C
	Tag = to ==> Row 4, Column C 
	Tag = vehicle ==> Row 6, Column C
	Tag = type ==> Row 7, Column C
	Tag = tracking ==> Row 8, Column C
	Tag = insurance ==> Row 9, Column C

Templatevalidationdata: When this function is called, the system should validate the data from the file uploaded against the rules for each data specified in this rules. Create a specific error for each one of the Tags to return to the user if any of the tag is not correct.
	Trigger to call the function ==> Called by Templateextractdata function.
	Tag = freight ==> Do not allow NULL, VARCHAR
	Tag = from ==> Do not allow NULL, VARCHAR
	Tag = to ==> Do not allow NULL, VARCHAR
	Tag = vehicle ==> Do not allow NULL, VARCHAR...Include Checkconstraint ("Urban Cargo"; "Rural Cargo"; "Truck"; "Heavy Truck")
	Tag = type ==> Do not allow NULL, VARCHAR...Include Checkconstraint ("Fleet"; "Third Part")
	Tag = tracking ==> Do not allow NULL, VARCHAR...Include Checkconstraint ("Real Time"; "No")
	Tag = insurance ==> Do not allow NULL, VARCHAR...Include Checkconstraint ("Yes"; "No")


new_Auction: When this function is called, the system should update the data of an existing auction in "auction_request" table of the database.
	Trigger to call the function ==> Push the button "start_auction" in New Auction Resume Page.
	Update in Database:
		updated_at; CURRENT TIMESTAMP WITH TIME ZONE;
		is_active; Yes;
		active_since; CURRENT TIMESTAMP WITH TIME ZONE;

participantvalidations: When this function is called, the system should validate the data from the "Participant Page" against the rules for each data specified in this rules. Create a specific error for each one of the validations to return to the user if any of the data filles in "Participant Page" is not correct.
	Trigger to call the function ==> This function will be called when the user fill the fields in "Participant Page".
	Name Input ==> Do not allow NULL, VARCHAR
	Email ==> Do not allow NULL, VARCHAR
	Contact Name ==> Do not allow NULL, VARCHAR
	Phone Contact ==> Do not allow NULL, VARCHAR

new_participant: When this function is called, the system should update the data of an existing partticipant in "participants_request" table of the database.
	Trigger to call the function ==> Push the button "Register" in Confirm new Participant Page.
	Update in Database:
		updated_at; CURRENT TIMESTAMP WITH TIME ZONE;
		is_active; Yes;
		active_since; CURRENT TIMESTAMP WITH TIME ZONE;

#Templates

##For Email Templates we will use Configuration Files, so please make sure to store templates in files (e.g., JSON, YAML) with version control.
##Create the following Templates in files:
	
	1. Email for Email Validation Template - V0:
		<!DOCTYPE html>
		<html lang="en">
		<head>
		    <meta charset="UTF-8">
		    <meta name="viewport" content="width=device-width, initial-scale=1.0">
		    <title>Verify Your Email Address</title>
		    <style>
		        body {
		            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		            line-height: 1.6;
		            color: #333333;
		            max-width: 600px;
		            margin: 0 auto;
		            padding: 20px;
		        }
		        .header {
		            text-align: center;
		            padding: 20px 0;
		            border-bottom: 1px solid #eaeaea;
		            margin-bottom: 30px;
		        }
		        .logo {
		            max-width: 180px;
		            height: auto;
		        }
		        .content {
		            padding: 0 20px;
		        }
		        .button {
		            display: inline-block;
		            padding: 12px 30px;
		            background-color: #4F46E5;
		            color: white !important;
		            text-decoration: none;
		            border-radius: 6px;
		            font-weight: 600;
		            margin: 25px 0;
		        }
		        .footer {
		            margin-top: 40px;
		            padding-top: 20px;
		            border-top: 1px solid #eaeaea;
		            font-size: 12px;
		            color: #666666;
		            text-align: center;
		        }
		        .code {
		            font-family: monospace;
		            font-size: 24px;
		            letter-spacing: 2px;
		            background-color: #f5f5f5;
		            padding: 10px 20px;
		            border-radius: 4px;
		            margin: 20px 0;
		            display: inline-block;
		        }
		        .expiry-note {
		            color: #666666;
		            font-size: 14px;
		            font-style: italic;
		        }
		    </style>
		</head>
		<body>
		    <div class="header">
		        <img src="https://yourdomain.com/logo.png" alt="Company Logo" class="logo">
		    </div>
		    
		    <div class="content">
		        <h2>Verify Your Email Address</h2>
		        
		        <p>Hello <strong>{{user_full_name}}</strong>,</p>
		        
		        <p>Thank you for signing up with {{company_name}}! To complete your registration, please verify your email address by entering the following verification code:</p>
		        
		        <div class="code">{{verification_code}}</div>
		        
		        <p class="expiry-note">This code will expire in 15 minutes.</p>
		        
		        <p>If you didn't create an account with us, you can safely ignore this email.</p>
		        
		        <p>For security reasons, please don't share this code with anyone. Our support team will never ask you for this code.</p>
		        
		        <p>Need help? Contact our support team at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a></p>
		        
		        <p>Welcome aboard!<br>The {{company_name}} Team</p>
		    </div>
		    
		    <div class="footer">
		        <p>© {{current_year}} {{company_name}}. All rights reserved.</p>
		        <p>
		            <a href="{{privacy_policy_url}}" style="color: #4F46E5; text-decoration: none;">Privacy Policy</a> | 
		            <a href="{{terms_url}}" style="color: #4F46E5; text-decoration: none;">Terms of Service</a>
		        </p>
		        <p>
		            {{company_address_line1}}<br>
		            {{company_address_line2}}
		        </p>
		        <p>
		            <a href="{{unsubscribe_url}}" style="color: #666666; text-decoration: underline;">Unsubscribe</a> | 
		            <a href="{{preferences_url}}" style="color: #666666; text-decoration: underline;">Email Preferences</a>
		        </p>
		    </div>
		</body>
		</html>

	2. Email for Password Reset Template - V0:
		<!DOCTYPE html>
		<html lang="en">
		<head>
		    <meta charset="UTF-8">
		    <meta name="viewport" content="width=device-width, initial-scale=1.0">
		    <title>Password Reset Request</title>
		    <style>
		        body {
		            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		            line-height: 1.6;
		            color: #333333;
		            max-width: 600px;
		            margin: 0 auto;
		            padding: 20px;
		        }
		        .header {
		            text-align: center;
		            padding: 20px 0;
		            border-bottom: 1px solid #eaeaea;
		            margin-bottom: 30px;
		        }
		        .logo {
		            max-width: 180px;
		            height: auto;
		        }
		        .content {
		            padding: 0 20px;
		        }
		        .button {
		            display: inline-block;
		            padding: 12px 30px;
		            background-color: #4F46E5;
		            color: white !important;
		            text-decoration: none;
		            border-radius: 6px;
		            font-weight: 600;
		            margin: 25px 0;
		        }
		        .footer {
		            margin-top: 40px;
		            padding-top: 20px;
		            border-top: 1px solid #eaeaea;
		            font-size: 12px;
		            color: #666666;
		            text-align: center;
		        }
		        .code {
		            font-family: monospace;
		            font-size: 24px;
		            letter-spacing: 2px;
		            background-color: #f5f5f5;
		            padding: 10px 20px;
		            border-radius: 4px;
		            margin: 20px 0;
		            display: inline-block;
		        }
		        .expiry-note {
		            color: #666666;
		            font-size: 14px;
		            font-style: italic;
		        }
		    </style>
		</head>
		<body>
		    <div class="header">
		        <img src="https://yourdomain.com/logo.png" alt="Company Logo" class="logo">
		    </div>
		    
		    <div class="content">
		        <h2>Reset Your Password</h2>
		        
		        <p>Hello <strong>{{user_full_name}}</strong>,</p>
		        
		        <p>We received a request to reset the password for your account. Use the following verification code to proceed:</p>
		        
		        <div class="code">{{verification_code}}</div>
		        
		        <p class="expiry-note">This code will expire in 15 minutes.</p>
		        
		        <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
		        
		        <p>For security reasons, please don't share this code with anyone. Our support team will never ask you for this code.</p>
		        
		        <p>Need help? Contact our support team at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a></p>
		        
		        <p>Best regards,<br>The {{company_name}} Team</p>
		    </div>
		    
		    <div class="footer">
		        <p>© {{current_year}} {{company_name}}. All rights reserved.</p>
		        <p>
		            <a href="{{privacy_policy_url}}" style="color: #4F46E5; text-decoration: none;">Privacy Policy</a> | 
		            <a href="{{terms_url}}" style="color: #4F46E5; text-decoration: none;">Terms of Service</a>
		        </p>
		        <p>
		            {{company_address_line1}}<br>
		            {{company_address_line2}}
		        </p>
		        <p>
		            <a href="{{unsubscribe_url}}" style="color: #666666; text-decoration: underline;">Unsubscribe</a> | 
		            <a href="{{preferences_url}}" style="color: #666666; text-decoration: underline;">Email Preferences</a>
		        </p>
		    </div>
		</body>
		</html>

#Additional Notes
	1. Indexes:
	Primary key index on "users_id"
	Unique index on email
	Unique index on verification_token
	Unique index on pr_token
	2. Default Values:
	is_active defaults to TRUE (new users are active by default)
	is_verified defaults to FALSE (email must be verified)
	created_at and updated_at are automatically managed by the database
	3. Security:
	Passwords are never stored in plain text - they are hashed using bcrypt
	"verification_token" and "pr_token" tokens are randomly generated 6 digit code (100000-999999)
	4. Relationships:
	Currently, there are no foreign key relationships in this schema