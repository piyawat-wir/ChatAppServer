import { Response as ExpressResponse } from 'express'

export const errorNoAuth = (res: ExpressResponse) => res.status(401).send('')
export const errorNotFound = (res: ExpressResponse) => res.status(404).send('')
export const errorBadRequest = (res: ExpressResponse) => res.status(400).send('')