import express from 'express';
import { 
    newPayee, 
    displayPayee, 
    showPayee, 
    editPayee,
    removePayee
} from '../controllers/payee.controller.js';

const router = express.Router();

router.get('/newpayee', newPayee);
router.get('/displaypayee', displayPayee);
router.get('/showpayee/:id', showPayee);
router.get('/editpayee/:id', editPayee);
router.get('/removepayee/:id', removePayee);

export default router;