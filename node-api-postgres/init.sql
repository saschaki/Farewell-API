CREATE TABLE quotes (
  ID SERIAL PRIMARY KEY,
  author VARCHAR(255) NOT NULL,
  quote VARCHAR(255) NOT NULL
);

INSERT INTO quotes (author, quote)
VALUES  ('Marianne Williamson', 'Our deepest fear is not that we are inadequate.
Our deepest fear is that we are powerful beyond measure.It is our light not our darkness that most frightens us.');