import Facebook from "/src/images/facebook-app-symbol.png"
import Phone from "/src/images/telephone.png"
import Email from "/src/images/email.png"

const Footer = () => {
  return (
    <>
        <div className="flex justify-between  grid-cols-3">
            <div className="flex gap-1">
                <div>
                    <img className="h-8" src={Facebook} alt="" />
                </div>
                <div className="my-auto">
                Bukidnon State University
                </div>
            </div>
            <div className="flex gap-1">
                <div>
                    <img className="h-8" src={Phone} alt="" />
                </div>
                <div className="my-auto">992 3456 789</div>
            </div>
            <div className="flex gap-1"> 
            <div>
                <img className="h-8" src={Email} alt="" />
            </div>
            <div className="my-auto">Bukidnon State University</div>
            </div>
        </div>
    </>
  )
}

export default Footer