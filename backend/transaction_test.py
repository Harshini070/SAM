from blockchain import Blockchain


ledger = Blockchain()


ledger.add_block(
    "Medicine Purchase ₹2500"
)

ledger.add_block(
    "Nutrition Pack ₹1500"
)

ledger.add_block(
    "F-75 Formula ₹3200"
)


for block in ledger.chain:

    print()

    print("Index:", block.index)

    print("Time:", block.timestamp)

    print("Transaction:",
          block.transaction)

    print("Previous Hash:",
          block.previous_hash)

    print("Hash:",
          block.hash)