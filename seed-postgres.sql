INSERT INTO records (title, category, description, status)
SELECT seed.*
FROM (
    VALUES
        ('Locate a research methods textbook', 'Book search', 'Help find a recent introductory research methods textbook in the catalogue.', 'Pending'),
        ('Renew an economics textbook', 'Borrowing', 'Check whether the current loan can be renewed for one more week.', 'In progress'),
        ('Restore access to my library account', 'Account help', 'The library sign-in page reports that the account is locked.', 'Completed'),
        ('Find past examination papers', 'Book search', 'Show where the library keeps past computer science examination papers.', 'In progress'),
        ('Reserve a borrowed statistics text', 'Borrowing', 'Place a hold on an introductory statistics book currently out on loan.', 'Pending'),
        ('Update the email for loan reminders', 'Account help', 'Help update the contact address used for due-date notices.', 'Completed'),
        ('Find local history reference books', 'Book search', 'Identify books on Zambian local history for a class research project.', 'Completed'),
        ('Check a returned book receipt', 'Borrowing', 'Confirm that a textbook returned at the service counter was checked in.', 'In progress')
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM seed_history WHERE name = 'library-service-demo-v1');

INSERT INTO seed_history (name) VALUES ('library-service-demo-v1') ON CONFLICT (name) DO NOTHING;
