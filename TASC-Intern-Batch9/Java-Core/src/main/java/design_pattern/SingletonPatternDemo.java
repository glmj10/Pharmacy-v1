package design_pattern;


public class SingletonPatternDemo {
    public static void main(String[] args) {
        SingletonPattern singletonPattern1 = SingletonPattern.getInstance();
        SingletonPattern singletonPattern2 = SingletonPattern.getInstance();

        singletonPattern1.log("This is single pattern 1");
        singletonPattern2.log("This is Single Pattern 2");

        if(singletonPattern1 == singletonPattern2) {
            System.out.println("object 1 and 2 are in the same instance");
        } else
            System.out.println("object 1 and 2 are not in the same instance");
    }
}

class SingletonPattern {
    private static SingletonPattern instance;

    private SingletonPattern() {

    }

    public static SingletonPattern getInstance() {
        if(instance == null) {
            instance = new SingletonPattern();
        } else
            System.out.println("Instance created");
        return instance;
    }

    public void log(String message) {
        System.out.println("Log: " + message);
    }
}
