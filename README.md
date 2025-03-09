# Island Club

# Instructions to Set Up and Run the Project

## Prerequisites

1. **Download Bun**:
   - Download and install Bun from [bun.sh](https://bun.sh).

2. **Download MongoDB**:
   - Download and install MongoDB from the official site.

3. **MetaMask Account**:
   - Ensure you have a MetaMask account set up on the Electroneum network.

## Steps to Set Up the Project

1. **Clone the Repository**:
   - Clone the project repository using the following command:
     ```bash
     git clone https://github.com/vitalspace/island.git
     ```

2. **Navigate to the Project Directory**:
   - Change to the project directory:
     ```bash
     cd island
     ```

3. **Project Structure**:
   - You will see three main folders:
     - `/frontend`
     - `/contracts`
     - `/backend`

4. **Set Up the Frontend**:
   - Navigate to the `/frontend` directory:
     ```bash
     cd frontend
     ```
   - Install the dependencies:
     ```bash
     bun i
     ```
   - Start the project in development mode:
     ```bash
     bun run dev
     ```

5. **Set Up the Backend**:
   - Navigate to the `/backend` directory:
     ```bash
     cd backend
     ```
   - Install the dependencies:
     ```bash
     bun i
     ```
   - Start the server in development mode:
     ```bash
     bun run dev
     ```

6. **View the Project Live**:
   - Open your browser and go to [http://localhost:5173/](http://localhost:5173/) to view the project live.

## Modify the ERC20 Contract Address

- If you want to change the ERC20 contract address, edit the file:
  ```
  /frontend/src/lib/constants/constants.ts
  ```
  - Modify the contract address with your own.

## Contract Code

- The contract code is located in the `/contracts` folder.

---

Please contact me if you have any questions or need further assistance. vitalcode2022@gmail.com
