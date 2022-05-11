import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

class CreateTransferController {

  async handle(req: Request, res: Response): Promise<Response> {
    const { id: sender_id } = req.user;
    const { amount, description } = req.body;
    const { user_id } = req.params;

    const createTransferStatement = container.resolve(CreateTransferUseCase);

    const statementTransfer = await createTransferStatement.execute({
      user_id,
      sender_id,
      amount,
      description
    });

    return res.status(201).json(statementTransfer);
  }

}

export { CreateTransferController }
