package static_and_final;

public class Static {

    public static void main(String[] args) {
        Test t = new Test();
        System.out.println(Test.getCnt());
        t = new Test();
        System.out.println(Test.getCnt());
    }
}

class Test {
    private static int cnt = 0;
    public static String s = "Hello";

    public static int getCnt() {
        return cnt;
    }

    public Test() {
        cnt ++;
    }
}
