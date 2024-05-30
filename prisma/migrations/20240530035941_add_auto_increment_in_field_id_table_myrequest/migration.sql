-- AlterTable
CREATE SEQUENCE myrequest_no_seq;
ALTER TABLE "MyRequest" ALTER COLUMN "no" SET DEFAULT nextval('myrequest_no_seq');
ALTER SEQUENCE myrequest_no_seq OWNED BY "MyRequest"."no";
