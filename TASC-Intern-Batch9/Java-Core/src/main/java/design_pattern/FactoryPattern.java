package design_pattern;

public class FactoryPattern {
    public static void main(String[] args) {
        Factory vnpayFactory = new VNPAYFactory();
        Payment vnpayPayment = vnpayFactory.createPayment();
        vnpayPayment.pay();

        Factory momoFactory = new MOMOFactory();
        Payment momoPayment = momoFactory.createPayment();
        momoPayment.pay();

    }
}

interface Payment {
    void pay();
}

class VNPAY implements Payment {
    @Override
    public void pay() {
        System.out.println("VNPAY method");
    }
}

class MOMO implements Payment {
    @Override
    public void pay() {
        System.out.println("MOMO method");
    }
}

abstract class Factory{
//    public static Payment createPayment(String paymentstr) {
//        Payment payment;
//        switch (paymentstr) {
//            case "VNPAY":
//                payment = new VNPAY();
//                break;
//            case "MOMO":
//                payment = new MOMO();
//                break;
//            default:
//                throw new IllegalArgumentException("Invalid Payment method");
//        }
//        return payment;
//    }

    public abstract Payment createPayment();
}

class VNPAYFactory extends Factory {
    @Override
    public Payment createPayment() {
        return new VNPAY();
    }
}

class MOMOFactory extends Factory {

    @Override
    public Payment createPayment() {
        return new MOMO();
    }
}

