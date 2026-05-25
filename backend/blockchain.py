import hashlib
import datetime


class Block:

    def __init__(self, index, transaction, previous_hash):

        self.index = index

        self.timestamp = str(
            datetime.datetime.now()
        )

        self.transaction = transaction

        self.previous_hash = previous_hash

        self.hash = self.calculate_hash()


    def calculate_hash(self):

        block_string = (
            str(self.index)
            + self.timestamp
            + str(self.transaction)
            + self.previous_hash
        )

        return hashlib.sha256(
            block_string.encode()
        ).hexdigest()
        
class Blockchain:

    def __init__(self):

        self.chain = [
            self.create_genesis_block()
        ]


    def create_genesis_block(self):

        return Block(
            0,
            "Genesis Block",
            "0"
        )


    def get_latest_block(self):

        return self.chain[-1]


    def add_block(self, transaction):

        previous = self.get_latest_block()

        new_block = Block(
            len(self.chain),
            transaction,
            previous.hash
        )

        self.chain.append(
            new_block
        )