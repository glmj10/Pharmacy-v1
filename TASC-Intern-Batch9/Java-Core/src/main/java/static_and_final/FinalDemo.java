package static_and_final;

public class FinalDemo {
    public static void main(String[] args) {
        //TH1: final không thể bị thay đổi
        final String s = "Hello";
        //s = "olala";  -- Lỗi biên dịch

        //Ví dụ chứng minh final không đảm báo sự thay đổi của đối tượng không bất biến
        final SinhVien sv = new SinhVien(2003, "Nguyen Van A");
        System.out.println(sv);

        sv.setBirthYear(2004);
        System.out.println(sv);
    }
}

class SinhVien {
    private int birthYear;
    private String fullName;

    public SinhVien() {

    }

    public SinhVien(int birthYear, String fullName) {
        this.birthYear = birthYear;
        this.fullName = fullName;
    }

    public int getBirthYear() {
        return birthYear;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setBirthYear(int birthYear) {
        this.birthYear = birthYear;
    }

    @Override
    public String toString() {
        return fullName + " " + birthYear;
    }
}
