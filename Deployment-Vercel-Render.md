# Deployment Guide for Vercel and Render

This guide provides step-by-step instructions to deploy the Personal Tracker application using Vercel for the frontend and Render for the backend and Python services.

## Architecture Overview

*   **Frontend (React)**: Deployed as a static site on [Vercel](https://vercel.com). Vercel will automatically build the React app and serve it from its global CDN. The `vercel.json` file will handle proxying `/api` requests to our backend.
*   **Backend (Node.js)**: Deployed as a Web Service on [Render](https://render.com).
*   **Python Service**: Deployed as a separate Web Service on [Render](https://render.com).
*   **PostgreSQL Database**: Deployed as a managed PostgreSQL instance on Render.
*   **MongoDB Database**: Deployed on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (as Render does not have a managed MongoDB service).

## Prerequisites

*   A GitHub account with your project pushed to a repository.
*   A free [Vercel](https://vercel.com/signup) account.
*   A free [Render](https://render.com/register) account.
*   A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account.

---

## Step 1: Set up MongoDB Atlas

1.  Create a new project and a new cluster on MongoDB Atlas (the free M0 tier is sufficient).
2.  In the cluster's **Network Access** tab, add `0.0.0.0/0` to the IP access list to allow connections from anywhere (including Render). For better security, you can restrict this later once you know your Render services' outbound IP addresses.
3.  In the **Database Access** tab, create a database user with a username and password.
4.  Go to **Database**, click **Connect** for your cluster, select **Drivers**, and copy the **Connection String**. Replace `<username>`, `<password>`, and `?retryWrites=true&w=majority` with the credentials you just created. This is your `MONGO_URI`.

---

## Step 2: Deploy Python Service to Render

1.  On the Render Dashboard, click **New +** > **Web Service**.
2.  Connect your GitHub account and select your project repository.
3.  Fill out the service details:
    *   **Name**: `python-service` (or similar).
    *   **Root Directory**: `python-service`
    *   **Runtime**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `python app.py`
4.  Click **Create Web Service**. Render will deploy it.
5.  Once deployed, copy the service's URL (e.g., `https://python-service-xyz.onrender.com`). You will need this for the backend configuration.

---

## Step 3: Deploy Backend and PostgreSQL to Render

First, create the database:

1.  On the Render Dashboard, click **New +** > **PostgreSQL**.
2.  Give it a name and choose the free plan.
3.  After it's created, copy the **Internal Connection String**. You'll use this for the backend's environment variables.

Next, create the backend web service:

1.  Click **New +** > **Web Service** and select the same repository.
2.  Fill out the service details:
    *   **Name**: `backend` (or similar).
    *   **Root Directory**: `backend`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node index.js`
3.  Go to the **Environment** tab and add the following secrets:
    *   `MONGO_URI`: The connection string from MongoDB Atlas (Step 1).
    *   `PYTHON_SERVICE_URL`: The URL of your deployed Python service from Step 2.
    *   `JWT_SECRET`: A long, random string for signing tokens (e.g., you can generate one with `openssl rand -hex 32`).
    *   From your Render PostgreSQL **Internal Connection String**, extract and add the following:
        *   `PG_HOST`
        *   `PG_USER`
        *   `PG_PASSWORD`
        *   `PG_DATABASE`
        *   `PG_PORT`
4.  Click **Create Web Service**.
5.  Once deployed, copy the service's URL (e.g., `https://backend-abc.onrender.com`).

---

## Step 4: Deploy Frontend to Vercel

1.  Log in to Vercel and click **Add New...** > **Project**.
2.  Import your Git repository.
3.  In the **Configure Project** screen:
    *   Vercel should automatically detect the **Framework Preset** as `Vite`.
    *   Expand the **Root Directory** section and set it to `frontend2`.
4.  Vercel will build and deploy your project.
5.  **Final Configuration**:
    *   After deployment, go to your project's dashboard on Vercel.
    *   You need to update the `frontend2/vercel.json` file you created earlier.
    *   Replace `https://your-backend-service-url.onrender.com` with the actual URL of your Render backend service from Step 3.
    *   Commit and push this change to GitHub. Vercel will automatically trigger a new deployment with the correct backend URL.

Your application is now live! The Vercel frontend will serve as the public entry point, and its API requests will be correctly routed to the backend running on Render. 